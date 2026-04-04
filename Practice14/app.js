const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const list = document.getElementById('notes-list');

function loadNotes() {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  if (notes.length === 0) {
    list.innerHTML = '<li style="text-align: center; color: #b7a287;">📭 Нет заметок. Добавьте первую!</li>';
    return;
  }
  list.innerHTML = notes.map((note, index) => `
    <li>
      ${note}
      <button 
        class="delete-note" 
        data-index="${index}"
        style="float: right; background: none; border: none; color: #d4b89c; cursor: pointer; font-size: 1.2rem;"
      >🗑</button>
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

// Обработка отправки формы
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    addNote(text);
    input.value = '';
    input.focus();
  }
});

// Первоначальная загрузка
loadNotes();

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