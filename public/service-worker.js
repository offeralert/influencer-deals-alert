
// Get cache version from URL parameter or use fallback
const urlParams = new URLSearchParams(self.location.search);
const CACHE_VERSION = urlParams.get('v') || Date.now().toString();
const CACHE_NAME = `offer-alert-${CACHE_VERSION}`;

// URLs to cache - using dynamic versioning
const urlsToCache = [
  '/',
  '/index.html',
  `/manifest.json?v=${CACHE_VERSION}`
];

console.log('Service Worker: Cache version', CACHE_VERSION);

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing with cache version', CACHE_VERSION);
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Network first strategy for HTML files to ensure fresh content
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If network request succeeds, cache it and return
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // For other resources, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response as it can only be consumed once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });

          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating with cache version', CACHE_VERSION);
  // Take control of all clients immediately
  self.clients.claim();
  
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle cache updates and notify clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skipping waiting');
    self.skipWaiting();
  }
});

// Send message to clients when cache is updated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'CACHE_UPDATED',
          version: CACHE_VERSION
        });
      });
    })
  );
});
