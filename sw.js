// Service Worker für Vokabel Master+
// Strategie: Netzwerk zuerst (mit Timeout), Cache als Offline-Fallback.
// So kommen Updates ohne manuelles Cache-Leeren an, und die App läuft trotzdem offline.
const CACHE_NAME = 'vokabel-master-v2.2.0';
const NETWORK_TIMEOUT_MS = 3500;
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css?v=2.2.0',
  './vocabulary.js?v=2.2.0',
  './app.js?v=2.2.0',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith('vokabel-master-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

async function fromCache(cacheKey, isNavigation) {
  const cached = await caches.match(cacheKey, { ignoreSearch: true });
  if (cached) return cached;
  if (isNavigation) return caches.match('./index.html');
  return undefined;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  // Navigationen landen immer auf der App-Shell (Query-Parameter egal)
  const cacheKey = isNavigation ? './index.html' : request;

  const network = fetch(request).then((response) => {
    if (response && response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, copy)).catch(() => null);
    }
    return response;
  });

  event.respondWith(new Promise((resolve) => {
    let settled = false;
    const finish = (response) => {
      if (!settled && response) {
        settled = true;
        resolve(response);
      }
    };

    // Langsames Netz: nach Timeout auf Cache ausweichen – aber nur, wenn es dort etwas gibt
    const timer = setTimeout(() => {
      fromCache(cacheKey, isNavigation).then(finish);
    }, NETWORK_TIMEOUT_MS);

    network.then((response) => {
      clearTimeout(timer);
      finish(response);
    }).catch(async () => {
      clearTimeout(timer);
      const cached = await fromCache(cacheKey, isNavigation);
      finish(cached || new Response('Offline', { status: 503, statusText: 'Offline' }));
    });
  }));
});
