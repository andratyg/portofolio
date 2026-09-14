// Service Worker for Nara Andra Tyaga Portfolio
// Robust, lightweight PWA caching with strict origin checking
const CACHE_NAME = 'nat-portfolio-v5';

// Truly static, unversioned assets ONLY (NEVER cache '/' or dynamic HTML shells)
const STATIC_ASSETS = [
  '/icon.svg',
  '/profile-fallback.jpg',
  '/manifest.json',
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

// Activate — aggressively clean up ALL older caches to prevent stale chunk errors
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

  // STRICT BYPASS: Never intercept admin routes, API routes, or Next.js static chunks / HMR
  // This prevents outdated deployment chunk/CSS 404 errors and hydration mismatches (#418)
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next')
  ) {
    return;
  }

  // Navigation requests: network-first with dedicated lightweight offline fallback (never stale HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        return new Response(
          '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline | Nara Andra Tyaga</title><style>body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0a0a0a;color:#fff;text-align:center;padding:20px}h1{font-size:24px;margin-bottom:8px}p{color:#888;font-size:14px;margin-bottom:20px}button{background:#3b82f6;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer}</style></head><body><div><h1>Anda Sedang Offline</h1><p>Koneksi internet terputus. Silakan periksa jaringan Anda.</p><button onclick="window.location.reload()">Coba Lagi</button></div></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
    );
    return;
  }

  // Static assets: cache-first with network fallback
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
