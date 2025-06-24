
const CACHE_VERSION = self.__SW_VERSION__ || `sw-${Date.now()}`;
const CACHE_NAME = `offer-alert-${CACHE_VERSION}`;

// Mobile-optimized caching strategy
const CACHE_FIRST_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/',
  '/assets/',
  '/favicon.ico',
  '/placeholder.svg'
];

const NETWORK_FIRST_URLS = [
  '/api/'
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
        // Skip waiting for faster updates on mobile
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
  
  // Cache first strategy for most content (better for mobile)
  if (CACHE_FIRST_URLS.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(cacheFirstStrategy(event.request));
  }
  // Network first only for API calls
  else if (NETWORK_FIRST_URLS.some(pattern => url.pathname.includes(pattern))) {
    event.respondWith(networkFirstStrategy(event.request));
  }
  // Default to cache first for everything else (mobile optimization)
  else {
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

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
      // Take control immediately for faster mobile experience
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
