
// Dynamic cache version will be injected during build
const CACHE_VERSION = 'v__CACHE_VERSION__';
const CACHE_NAME = `offer-alert-${CACHE_VERSION}`;

const urlsToCache = [
  '/',
  '/index.html',
  `/manifest.json?v=${CACHE_VERSION.replace('v', '')}`
];

console.log('Service Worker starting with cache version:', CACHE_VERSION);

self.addEventListener('install', (event) => {
  console.log('Service Worker installing with version:', CACHE_VERSION);
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching initial resources');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Error caching initial resources:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Use network-first strategy for HTML files and critical resources
  if (event.request.destination === 'document' || 
      url.pathname.endsWith('.html') ||
      url.pathname === '/' ||
      url.pathname.includes('manifest.json')) {
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // Use cache-first for other resources (JS, CSS, images)
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
        })
    );
  }
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating with version:', CACHE_VERSION);
  // Take control of all clients immediately
  self.clients.claim();
  
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that don't match current version
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Notify all clients that cache has been updated
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_UPDATED',
          version: CACHE_VERSION
        });
      });
    })
  );
});

// Handle cache updates and notify clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: CACHE_VERSION
    });
  }
});
