const CACHE = 'artefact-v3';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/', '/index.html', '/icons/icon-192.png', '/icons/icon-512.png']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // HTML — network first, cache fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Photos — cache first (they don't change)
  if (url.pathname.startsWith('/photos/') || url.pathname.startsWith('/icons/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(r => {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        });
      })
    );
    return;
  }

  // Everything else — network
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
