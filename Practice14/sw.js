const CACHE_NAME = 'notes-cache-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-128x128.png',
  '/icons/favicon-512x512.png'
];

//Кэшируем файлы
self.addEventListener('install', event => {
  console.log('📦 Service Worker устанавливается...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📁 Кэшируем файлы:', ASSETS);
        return cache.addAll(ASSETS);
      })
      .then(() => {
        console.log('✅ Кэширование завершено');
        return self.skipWaiting();
      })
  );
});

// Удаляем старые кэши
self.addEventListener('activate', event => {
  console.log('⚡ Service Worker активируется...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('🗑 Удаляем старый кэш:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('✅ Service Worker активирован');
      return self.clients.claim();
    })
  );
});

// Перехват fetch-запросов — сначала пытаемся взять из кэша, потом из сети
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('📦 Из кэша:', event.request.url);
          return response;
        }
        console.log('🌐 Из сети:', event.request.url);
        return fetch(event.request);
      })
  );
});