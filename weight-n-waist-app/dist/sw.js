// Bump this version whenever a cached app file changes.
const CACHE = 'weight-n-waist-shell-v1';
const PREFIX = 'weight-n-waist-shell-';
const ASSETS = [
  '/', '/index.html', '/style.css', '/app.js', '/pwa.js',
  '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png',
  '/icons/icon-maskable-512.png', '/icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    ASSETS.map(path => new Request(path, { cache: 'reload' })),
  )));
  // Let an update wait until all existing windows close. Never reload an unsaved form.
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match('/index.html')) || fetch(event.request);
    })());
  } else if (ASSETS.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(url.pathname)) || fetch(event.request);
    })());
  }
});
