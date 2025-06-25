
const CACHE_VERSION = self.__SW_VERSION__ || `sw-${Date.now()}`;
const CACHE_NAME = `offer-alert-${CACHE_VERSION}`;

// Updated caching strategy for better updates
const CACHE_FIRST_URLS = [
  '/assets/',
  '/lovable-uploads/',
  '/favicon.ico',
  '/placeholder.svg'
];

const NETWORK_FIRST_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/api/'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing version', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching critical resources');
        // Only cache truly static resources during install
        return cache.addAll([
          '/manifest.json'
        ]).catch(err => {
          console.log('Service Worker: Cache addAll failed:', err);
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Network first for HTML and critical files (ensures updates work)
  if (NETWORK_FIRST_URLS.some(pattern => url.pathname.includes(pattern)) || 
      url.pathname === '/' || 
      url.pathname.endsWith('.html')) {
    event.respondWith(networkFirstStrategy(event.request));
  }
  // Cache first only for truly static assets
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
    
    // Cache successful responses for non-HTML files
    if (networkResponse.ok && !request.url.includes('.html')) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Update cache in background for next time
      fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
          });
        }
      }).catch(() => {
        // Ignore background update failures
      });
      
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Cache first strategy failed:', error);
    return new Response('Offline - content not available', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating version', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('offer-alert-')) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Cache cleanup complete');
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    // Force update check
    self.registration.update().then(() => {
      event.ports[0].postMessage({
        type: 'UPDATE_CHECK_COMPLETE',
        version: CACHE_VERSION
      });
    });
  }
  
  if (event.data && event.data.type === 'APPLY_UPDATE') {
    // User chose to apply update
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear all caches
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({
        type: 'CACHE_CLEARED'
      });
    });
  }
});

// Handle push notifications for mobile
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/lovable-uploads/edf0a8ab-4e46-4096-9778-1873148c2812.png'
      })
    );
  }
});
