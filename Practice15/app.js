// Элементы DOM
const contentDiv = document.getElementById('app-content');
const homeBtn = document.getElementById('home-btn');
const aboutBtn = document.getElementById('about-btn');

// Функции для заметок
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
  
  // Добавляем обработчики для кнопок удаления
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
}

function deleteNote(index) {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.splice(index, 1);
  localStorage.setItem('notes', JSON.stringify(notes));
  loadNotes();
}

// Инициализация главной страницы (форма добавления и список заметок)
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

function setActiveButton(activeId) {
  [homeBtn, aboutBtn].forEach(btn => btn.classList.remove('active'));
  document.getElementById(activeId).classList.add('active');
}

async function loadContent(page) {
  try {
    const response = await fetch(`/content/${page}.html`);
    const html = await response.text();
    contentDiv.innerHTML = html;
    
    // Если загружена главная страница => инициализируем заметки
    if (page === 'home') {
      initNotes();
    }
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

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ ServiceWorker зарегистрирован:', registration.scope);
    } catch (err) {
      console.error('❌ Ошибка регистрации ServiceWorker: ', err);
    }
  });
}