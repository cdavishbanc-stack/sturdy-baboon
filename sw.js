const CACHE_NAME = 'holdforte-v1';
const ASSETS_TO_CACHE = [
  '/sturdy-baboon/',
  '/sturdy-baboon/index.html',
  '/sturdy-baboon/contractors.html',
  '/sturdy-baboon/property-managers.html',
  '/sturdy-baboon/about.html',
  '/sturdy-baboon/contact.html',
  '/sturdy-baboon/styles.css',
  '/sturdy-baboon/script.js',
  '/sturdy-baboon/manifest.json'
];

// Install — cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/sturdy-baboon/index.html');
        }
      });
    })
  );
});
