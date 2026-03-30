const CACHE = 'cuentasaldia-v1';
const STATIC = [
  '/mobile.html',
  '/css/mobile.css',
  '/js/shared/config.js',
  '/js/shared/utils.js',
  '/js/shared/storage.js',
  '/js/shared/share.js',
  '/js/mobile/main.js',
  '/js/mobile/render.js',
  '/js/mobile/sheets.js',
  '/js/mobile/charts.js',
  '/manifest-app.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
