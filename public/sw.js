// Service Worker for PWA — v4
// Intercepts manifest and icon requests to serve dynamic content from Cache API
const CACHE_NAME = "website-saya-v4";
const STATIC_ASSETS = ["/"];
const PWA_DATA_CACHE = "pwa-dynamic-data-v4";

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
        keys.filter((key) => key !== CACHE_NAME && key !== PWA_DATA_CACHE).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Listen for messages from the client to store logo/name data
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "STORE_PWA_DATA") {
    const { logoSrc, siteName, siteShortName } = event.data;
    caches.open(PWA_DATA_CACHE).then((cache) => {
      // Store metadata as a JSON response
      const metadata = { logoSrc, siteName, siteShortName, updatedAt: Date.now() };
      const response = new Response(JSON.stringify(metadata), {
        headers: { "Content-Type": "application/json" },
      });
      cache.put(new Request("/__pwa_metadata__"), response);

      // If logo is a data URL, also store the actual image for icon serving
      if (logoSrc && logoSrc.startsWith("data:")) {
        try {
          const matches = logoSrc.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const base64Data = matches[2];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            // Store regular icon (transparent background)
            const imageResponse = new Response(bytes, {
              headers: { "Content-Type": mimeType, "Cache-Control": "no-cache" },
            });
            cache.put(new Request("/__pwa_icon_192__"), imageResponse.clone());
            cache.put(new Request("/__pwa_icon_512__"), imageResponse.clone());

            // Store maskable icon (same image but will be served from network with maskable param)
            // The maskable padding is handled by the API route, not the SW
            cache.put(new Request("/__pwa_icon_maskable_192__"), imageResponse.clone());
            cache.put(new Request("/__pwa_icon_maskable_512__"), imageResponse);
          }
        } catch (e) {
          // Failed to store icon image
        }
      }
    });
  }
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Intercept manifest request — inject dynamic name and icons
  if (url.pathname === "/api/manifest" || url.pathname === "/manifest.json") {
    event.respondWith(
      (async () => {
        try {
          // Try to get cached PWA metadata
          const cache = await caches.open(PWA_DATA_CACHE);
          const metaResponse = await cache.match(new Request("/__pwa_metadata__"));
          const metadata = metaResponse ? await metaResponse.json() : null;

          // Try fetching the real manifest first
          try {
            const networkResponse = await fetch(event.request);
            if (networkResponse.ok && !metadata) {
              return networkResponse;
            }
            // If we have metadata, modify the manifest
            if (metadata) {
              let manifest;
              try {
                manifest = await networkResponse.json();
              } catch {
                manifest = {
                  name: "Website Saya",
                  short_name: "WebsiteSaya",
                  description: "Portofolio pribadi yang menciptakan pengalaman digital elegan.",
                  start_url: "/",
                  display: "standalone",
                  background_color: "#0a0a0a",
                  theme_color: "#d97706",
                  orientation: "portrait-primary",
                  icons: [],
                };
              }

              // Override name
              if (metadata.siteName) {
                manifest.name = metadata.siteName;
              }
              if (metadata.siteShortName) {
                manifest.short_name = metadata.siteShortName;
              }

              // Override icons with separate "any" and "maskable" entries
              if (metadata.logoSrc) {
                manifest.icons = [
                  { src: "/api/logo-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
                  { src: "/api/logo-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
                  { src: "/api/logo-icon?size=192&maskable=true", sizes: "192x192", type: "image/png", purpose: "maskable" },
                  { src: "/api/logo-icon?size=512&maskable=true", sizes: "512x512", type: "image/png", purpose: "maskable" },
                ];
              }

              return new Response(JSON.stringify(manifest), {
                headers: { "Content-Type": "application/manifest+json", "Cache-Control": "no-cache" },
              });
            }

            return networkResponse;
          } catch {
            // Network failed — return basic manifest with separate icon purposes
            return new Response(
              JSON.stringify({
                name: metadata?.siteName || "Website Saya",
                short_name: metadata?.siteShortName || "WebsiteSaya",
                description: "Portofolio pribadi yang menciptakan pengalaman digital elegan.",
                start_url: "/",
                display: "standalone",
                background_color: "#0a0a0a",
                theme_color: "#d97706",
                orientation: "portrait-primary",
                icons: metadata?.logoSrc
                  ? [
                      { src: "/api/logo-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
                      { src: "/api/logo-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
                      { src: "/api/logo-icon?size=192&maskable=true", sizes: "192x192", type: "image/png", purpose: "maskable" },
                      { src: "/api/logo-icon?size=512&maskable=true", sizes: "512x512", type: "image/png", purpose: "maskable" },
                    ]
                  : [
                      { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
                      { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
                      { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
                      { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
                    ],
              }),
              { headers: { "Content-Type": "application/manifest+json" } }
            );
          }
        } catch {
          return fetch(event.request);
        }
      })()
    );
    return;
  }

  // Intercept PWA icon requests — serve from cache
  if (url.pathname === "/__pwa_icon_192__" || url.pathname === "/__pwa_icon_512__" ||
      url.pathname === "/__pwa_icon_maskable_192__" || url.pathname === "/__pwa_icon_maskable_512__") {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(PWA_DATA_CACHE);
          const cached = await cache.match(new Request(url.pathname));
          if (cached) return cached;
        } catch {
          // Cache miss
        }
        // Fallback to static files
        const fallback = url.pathname.includes("192") ? "/logo-192.png" : "/logo-512.png";
        return fetch(fallback).catch(() => new Response("", { status: 404 }));
      })()
    );
    return;
  }

  // For other requests: network first, fallback to cache
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
