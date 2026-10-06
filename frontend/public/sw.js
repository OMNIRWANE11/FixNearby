const CACHE_NAME = 'fixnearby-pwa-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
  '/images/hero-emergency.svg',
  '/images/electrical.svg',
  '/images/plumbing.svg',
  '/images/automotive.svg',
  '/images/locksmith.svg',
  '/images/safety-electrical.svg',
  '/images/safety-water.svg',
  '/images/safety-vehicle.svg',
  '/images/safety-locksmith.svg',
  '/images/safety-gas.svg',
  '/images/badge-shield.svg',
  '/images/technicians/tech-default.svg',
];

// Install: Cache Shell & Offline Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching emergency offline shell');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Purge Outdated Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache: ', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Navigation (HTML Pages): Network first, then Cache, then Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
    );
    return;
  }

  // 2. OpenStreetMap Tiles & External Static Images: Cache First
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. API Directory & Categories: Stale-While-Revalidate
  if (url.pathname.startsWith('/api/v1/categories') || url.pathname.startsWith('/api/v1/technicians')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 4. Default: Cache First, Network Fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request);
    })
  );
});

