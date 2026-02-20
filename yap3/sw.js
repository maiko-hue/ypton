// sw.js - Service Worker Nivel Producción (Anti-fallos)
const CACHE_NAME = 'yape-v2'; // Cambiar este número fuerza la actualización en los celulares

// Solo cacheamos lo ultra necesario para que la instalación nunca falle
const urlsToCache = [
  '/',
  '/index.html',
  '/img/favicon.png'
];

// 1. INSTALACIÓN (Sin morir en el intento)
self.addEventListener('install', event => {
  self.skipWaiting(); // Fuerza a que la nueva versión tome el control de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Error al cachear, pero seguimos vivos:', err))
  );
});

// 2. ACTIVACIÓN (El limpiador de basura vieja)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si encuentra un caché viejo, lo destruye
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de todas las pantallas abiertas
  );
});

// 3. INTERCEPTOR DE RED
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve lo del caché si existe, si no, lo busca en internet normalmente
        return response || fetch(event.request);
      })
  );
});