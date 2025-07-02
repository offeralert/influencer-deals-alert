
const CACHE_VERSION = self.__SW_VERSION__ || `sw-${Date.now()}`;
const CACHE_NAME = `offer-alert-${CACHE_VERSION}`;

// Enhanced caching strategies for different resource types
const CACHE_STRATEGIES = {
  CACHE_FIRST: [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/placeholder.svg'
  ],
  STALE_WHILE_REVALIDATE: [
    '/lovable-uploads/',
    '/assets/'
  ],
  NETWORK_FIRST: [
    '/api/'
  ]
};

// Critical resources to preload
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing version', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES).catch(err => {
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
  
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Determine caching strategy based on URL
  if (shouldUseNetworkFirst(url.pathname)) {
    event.respondWith(networkFirstStrategy(event.request));
  } else if (shouldUseStaleWhileRevalidate(url.pathname)) {
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  } else {
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

function shouldUseNetworkFirst(pathname) {
  return CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => pathname.includes(pattern));
}

function shouldUseStaleWhileRevalidate(pathname) {
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(pattern => pathname.includes(pattern));
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

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Return cached version if network fails
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
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
      return self.clients.claim();
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    event.ports[0].postMessage({
      type: 'UPDATE_AVAILABLE',
      version: CACHE_VERSION
    });
  }
  
  if (event.data && event.data.type === 'APPLY_UPDATE') {
    self.skipWaiting();
  }
});

// Enhanced push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/lovable-uploads/edf0a8ab-4e46-4096-9778-1873148c2812.png',
        badge: '/lovable-uploads/edf0a8ab-4e46-4096-9778-1873148c2812.png',
        tag: 'offer-alert',
        renotify: true,
        requireInteraction: false,
        silent: false
      })
    );
  }
});
