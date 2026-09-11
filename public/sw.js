// Service Worker for Nara Andra Tyaga Portfolio
// Robust, lightweight PWA caching with strict origin checking
const CACHE_NAME = 'nat-portfolio-v4';
const STATIC_ASSETS = [
  '/',
  '/icon.svg',
  '/profile-fallback.jpg',
];

// Install — cache static assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          // ignore missing assets
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // ONLY handle same-origin requests (never intercept Firestore, Google APIs, extensions)
  if (url.origin !== self.location.origin) return;

  // Ignore Next.js internal and dev routes
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next/webpack-hmr')) return;

  // Navigation requests: network first with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match('/');
        return cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      })
    );
    return;
  }

  // Static assets: cache first with network fallback
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        });
      }).catch(() => new Response('', { status: 404 }))
    );
  }
});

