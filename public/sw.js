// Service Worker for PWA
const CACHE_NAME = "website-saya-v2";
const STATIC_ASSETS = ["/"];

// Install - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch - network first for API/manifest, cache first for static assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Never cache API routes or manifest — always fetch fresh
  if (url.pathname.startsWith("/api/") || url.pathname === "/manifest.json") {
    event.respondWith(
      fetch(event.request).catch(() => new Response("Offline", { status: 503 }))
    );
    return;
  }

  // For other requests: network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
