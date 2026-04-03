const CACHE_NAME = 'notes-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js'
];

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
        // Если ресурс есть в кэше — возвращаем его
        if (response) {
          console.log('📦 Из кэша:', event.request.url);
          return response;
        }
        // Иначе идём в сеть
        console.log('🌐 Из сети:', event.request.url);
        return fetch(event.request);
      })
  );
});