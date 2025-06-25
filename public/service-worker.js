
const CACHE_VERSION = self.__SW_VERSION__ || `sw-${Date.now()}`;
const CACHE_NAME = `offer-alert-${CACHE_VERSION}`;

// Network-first URLs (always fetch fresh)
const NETWORK_FIRST_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/api/'
];

// Cache-first URLs (for static assets)
const CACHE_FIRST_URLS = [
  '/assets/',
  '/lovable-uploads/',
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
        ]).catch(err => {
          console.log('Service Worker: Cache addAll failed:', err);
          // Don't fail installation if some resources fail to cache
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        // Force immediate activation
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
  
  // Network first strategy for HTML and critical resources
  if (NETWORK_FIRST_URLS.some(pattern => url.pathname.includes(pattern) || url.pathname === pattern)) {
    event.respondWith(networkFirstStrategy(event.request));
  }
  // Cache first strategy for static assets
  else if (CACHE_FIRST_URLS.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(cacheFirstStrategy(event.request));
  }
  // Default to network first for everything else to ensure freshness
  else {
    event.respondWith(networkFirstStrategy(event.request));
  }
});

async function networkFirstStrategy(request) {
  try {
    // Always try network first for HTML and critical resources
    const networkResponse = await fetch(request, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a basic offline response for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><title>Offline</title></head>
          <body>
            <h1>You're offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Offline', { status: 503 });
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
          // Delete all old caches to ensure fresh content
          if (cacheName !== CACHE_NAME && cacheName.startsWith('offer-alert-')) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Cache cleanup complete');
      // Take control immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    // Always report update available to force refresh
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

// Handle push notifications
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
