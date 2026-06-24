const CACHE = "pullout-v1";

const filesToCache = [
  "/",
  "/index.html"
];

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(filesToCache))
  );

});

self.addEventListener("fetch", event => {

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );

});
