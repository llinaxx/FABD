const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// === ВСТАВЬ СВОИ VAPID-КЛЮЧИ ===
const vapidKeys = {
  publicKey: 'BOrXUkbFjiDo3G7u8zvZmvfp2ofcgtM8vgJfdkPJdOWsKJDOgGY_1iUEmQsGe4DpUXKsyj1yxT_bGw3bVvFtfHs',
  privateKey: 'Z5zu5CjTGWGks8A71mzhavd6M9T6_fqdzSfHFGmBBuQ'
};

webpush.setVapidDetails(
  'mailto:grevtseva.a.a@edu.mirea.ru', 
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..')));

// === ЗАГРУЗКА СЕРТИФИКАТОВ ДЛЯ HTTPS ===
const options = {
  key: fs.readFileSync(path.join(__dirname, '../localhost+2-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../localhost+2.pem'))
};

let subscriptions = [];

const server = https.createServer(options, app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log('✅ Клиент подключён:', socket.id);

  socket.on('newTask', (task) => {
    console.log('📝 Новая задача:', task);

    io.emit('taskAdded', task);

    const payload = JSON.stringify({
      title: 'Новая задача',
      body: task.text
    });

    // Отправляем уведомление всем подписанным клиентам
    subscriptions.forEach(sub => {
      webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Клиент отключён:', socket.id);
  });
});

// Эндпоинт для сохранения push-подписки
app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  res.status(201).json({ message: 'Подписка сохранена' });
});

// Эндпоинт для удаления push-подписки
app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
  res.status(200).json({ message: 'Подписка удалена' });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 HTTPS сервер запущен на https://localhost:${PORT}`);
});