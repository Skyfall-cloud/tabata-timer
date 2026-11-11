
const CACHE_NAME = 'tabata-timer-v2';
const CACHE_PREFIX = 'tabata-timer-';

const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names =>
        Promise.all(
          names
            .filter(name =>
              name.startsWith(CACHE_PREFIX) &&
              name !== CACHE_NAME
            )
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !url.href.startsWith(self.registration.scope)
  ) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });

        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;

        if (request.mode === 'navigate') {
          return await caches.match('./index.html');
        }

        throw error;
      }
    })()
  );
});
