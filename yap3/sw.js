// sw.js - Service Worker para descargar la App
const CACHE_NAME = 'yape';
const urlsToCache = [
  '/',
  '/index.html',
  '/inicio.html',
  '/seguridad.js',
  '/firebase.js',
  '/img/favicon.png'
  // Añade aquí cualquier otra imagen o archivo CSS que uses
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});