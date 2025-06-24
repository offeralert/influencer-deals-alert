const CACHE_VERSION = self.__SW_VERSION__ || 'sw-fallback';
const CACHE_NAME = `offer-alert-${CACHE_VERSION}`;

const NETWORK_FIRST_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const CACHE_FIRST_URLS = [
  '/lovable-uploads/',
  '/assets/',
  '/favicon.ico',
  '/placeholder.svg'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing version', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching critical resources');
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json'
        ]);
      })
      .then(() => {
        // Don't force activation immediately - let user control updates
        console.log('Service Worker: Installation complete');
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Network first for critical pages and API calls
  if (NETWORK_FIRST_URLS.some(pattern => url.pathname.includes(pattern)) || 
      url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
  }
  // Cache first for static assets
  else if (CACHE_FIRST_URLS.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(cacheFirstStrategy(event.request));
  }
  // Default to network first for everything else
  else {
    event.respondWith(networkFirstStrategy(event.request));
  }
});

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Both cache and network failed:', error);
    return new Response('Resource not available', { status: 404 });
  }
}

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches but keep current one
          if (cacheName !== CACHE_NAME && cacheName.startsWith('offer-alert-')) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Cache cleanup complete');
      // Only claim clients after cache cleanup is done
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    // Notify about available update without forcing it
    event.ports[0].postMessage({
      type: 'UPDATE_AVAILABLE',
      version: CACHE_VERSION
    });
  }
  
  if (event.data && event.data.type === 'APPLY_UPDATE') {
    // User chose to apply update
    self.skipWaiting();
  }
});
