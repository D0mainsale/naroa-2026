const CACHE_NAME = 'naroa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/main.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(fetchResponse => {
            // Only cache successful requests for images/data
            if (event.request.url.includes('/images/') || event.request.url.includes('/data/')) {
                const cacheCopy = fetchResponse.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
            }
            return fetchResponse;
        });
      })
  );
});
