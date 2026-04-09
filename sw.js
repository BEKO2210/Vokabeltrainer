// Service Worker für Vokabel Master+
const CACHE_NAME = 'vokabel-master-v1.0.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

// Installation: Cache alle statischen Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Aktivierung: Alte Caches löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => {
        return self.clients.claim();
      })
      .then(async () => {
        // Offene Tabs sofort auf die neue Version bringen
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        await Promise.all(
          clients.map((client) => {
            if ('navigate' in client && client.url) {
              return client.navigate(client.url).catch(() => null);
            }
            return Promise.resolve();
          })
        );
      })
  );
});

// Fetch: Cache-First Strategie
self.addEventListener('fetch', (event) => {
  // Nur idempotente GET-Requests behandeln, um Nebenwirkungen
  // bei zukünftigen POST/PUT/DELETE-Endpunkten zu vermeiden.
  if (event.request.method !== 'GET') {
    return;
  }

  // Nicht-http(s) Requests (z.B. Browser-Extensions) ignorieren
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Navigationsanfragen: bevorzugt Netzwerk, damit Updates direkt sichtbar sind
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('./index.html', responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((response) => {
            // Nur erfolgreiche Anfragen cachen
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((err) => {
                console.warn('Cache put failed:', err);
              });
            return response;
          })
          .catch(() => {
            // Offline-Fallback für HTML
            const accept = event.request.headers.get('accept');
            if (accept && accept.includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});
