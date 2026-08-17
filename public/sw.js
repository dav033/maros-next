const CACHE = "maros-shell-v2";
const STATIC_ASSET = /\/_next\/static\/|\.(?:css|js|woff2?|svg|png|jpg|jpeg|webp)$/i;
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["/tasks?view=mine", "/manifest.webmanifest"])));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return;
  if (event.request.mode === "navigate") {
    // API responses can contain authenticated CRM data and must never be
    // persisted or replayed by this generic service worker.
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/tasks?view=mine"))));
    return;
  }
  if (!STATIC_ASSET.test(new URL(event.request.url).pathname)) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) void caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
