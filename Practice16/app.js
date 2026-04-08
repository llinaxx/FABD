// Элементы DOM
const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

// === WEBSOCKET ПОДКЛЮЧЕНИЕ ===
const socket = io('https://localhost:3001');

function loadNotes() {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  const list = document.getElementById('notes-list');
  if (!list) return;
  
  if (notes.length === 0) {
    list.innerHTML = '<li style="text-align: center; color: #b7a287;">📭 Нет заметок. Добавьте первую!</li>';
    return;
  }
  
  list.innerHTML = notes.map((note, index) => `
    <li>
      ${note}
      <button class="delete-note" data-index="${index}">🗑</button>
    </li>
  `).join('');
  
  document.querySelectorAll('.delete-note').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(btn.dataset.index);
      deleteNote(index);
    });
  });
}

function addNote(text) {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.push(text);
  localStorage.setItem('notes', JSON.stringify(notes));
  loadNotes();
  
  socket.emit('newTask', { text: text });
}

function deleteNote(index) {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.splice(index, 1);
  localStorage.setItem('notes', JSON.stringify(notes));
  loadNotes();
}

function initNotes() {
  const form = document.getElementById('note-form');
  const input = document.getElementById('note-input');
  if (!form) return;
  loadNotes();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      addNote(text);
      input.value = '';
      input.focus();
    }
  });
}

// === ПОЛУЧЕНИЕ СОБЫТИЙ ОТ ДРУГИХ КЛИЕНТОВ ===
socket.on('taskAdded', (task) => {
  console.log('📢 Задача от другого клиента:', task);
  const notification = document.createElement('div');
  notification.textContent = `📝 Новая задача: ${task.text}`;
  notification.style.cssText = `
    position: fixed; top: 10px; right: 10px; 
    background: #d4b89c; color: #8b7356; 
    padding: 12px; border-radius: 12px; 
    z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
});

// === PUSH-УВЕДОМЛЕНИЯ ===
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('BN-Zp9qWNN4qx0qxXSjaFyHOFPIbSSf7kBN8PvSs6P7xbUn26zpCUM-Pg3FFP4Ntpwems13diciIBGuQp48i1dk') // замени!
    });
    await fetch('http://localhost:3001/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });
    console.log('✅ Подписка на push отправлена');
  } catch (err) {
    console.error('❌ Ошибка подписки на push:', err);
  }
}

async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await fetch('http://localhost:3001/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
    await subscription.unsubscribe();
    console.log('✅ Отписка выполнена');
  }
}

// Навигация
function setActiveButton(activeId) {
  [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
  document.getElementById(activeId).classList.add('active');
}

async function loadContent(page) {
  try {
    const response = await fetch(`/content/${page}.html`);
    const html = await response.text();
    contentDiv.innerHTML = html;
    if (page === 'home') initNotes();
  } catch (err) {
    contentDiv.innerHTML = '<p class="is-center" style="color: red;">Ошибка загрузки страницы.</p>';
    console.error(err);
  }
}

homeBtn.addEventListener('click', () => {
  setActiveButton('home-btn');
  loadContent('home');
});

aboutBtn.addEventListener('click', () => {
  setActiveButton('about-btn');
  loadContent('about');
});

loadContent('home');

// === РЕГИСТРАЦИЯ SERVICE WORKER И УПРАВЛЕНИЕ УВЕДОМЛЕНИЯМИ ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ ServiceWorker зарегистрирован:', registration.scope);
      
      const enableBtn = document.getElementById('enable-push');
      const disableBtn = document.getElementById('disable-push');
      
      if (enableBtn && disableBtn) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          enableBtn.style.display = 'none';
          disableBtn.style.display = 'inline-block';
        }
        
        enableBtn.addEventListener('click', async () => {
          if (Notification.permission === 'denied') {
            alert('Уведомления запрещены. Разрешите их в настройках браузера.');
            return;
          }
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
              alert('Необходимо разрешить уведомления.');
              return;
            }
          }
          await subscribeToPush();
          enableBtn.style.display = 'none';
          disableBtn.style.display = 'inline-block';
        });
        
        disableBtn.addEventListener('click', async () => {
          await unsubscribeFromPush();
          disableBtn.style.display = 'none';
          enableBtn.style.display = 'inline-block';
        });
      }
    } catch (err) {
      console.log('❌ Sw registration failed:', err);
    }
  });
}