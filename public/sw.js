// Service Worker for PWA — v6
// Simplified: NO manifest/icon interception — let the network serve fresh manifest & icons
const CACHE_NAME = "website-saya-v6";
const PWA_DATA_CACHE = "pwa-dynamic-data-v6";

// Install — just activate immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate — clean ALL old caches, claim all clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Listen for messages from the client to store logo/name data
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "STORE_PWA_DATA") {
    const { logoSrc, siteName, siteShortName } = event.data;
    caches.open(PWA_DATA_CACHE).then((cache) => {
      const metadata = { logoSrc, siteName, siteShortName, updatedAt: Date.now() };
      const response = new Response(JSON.stringify(metadata), {
        headers: { "Content-Type": "application/json" },
      });
      cache.put(new Request("/__pwa_metadata__"), response);
    });
  }
});

// Fetch handler — network first for all requests, cache as fallback
// Manifest and icon requests go DIRECTLY to network (no interception)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
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
