
// Dynamic cache version from build
export const CACHE_VERSION = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : Date.now().toString());

/**
 * Adds cache busting parameter to a URL with mobile Safari optimization
 */
export const addCacheBuster = (url: string, version: string = CACHE_VERSION): string => {
  const separator = url.includes('?') ? '&' : '?';
  // Add timestamp for mobile Safari cache busting
  return `${url}${separator}v=${version}&t=${Date.now()}&mobile=${isMobileSafari() ? '1' : '0'}`;
};

/**
 * Detect mobile Safari for specific handling
 */
const isMobileSafari = (): boolean => {
  return /Safari/.test(navigator.userAgent) && 
         /Mobile/.test(navigator.userAgent) && 
         !/Chrome/.test(navigator.userAgent);
};

/**
 * Check for service worker updates with mobile optimization
 */
export const checkForUpdates = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    // Check if there's a waiting service worker
    if (registration.waiting) {
      return true;
    }

    // Force update check for mobile Safari
    if (isMobileSafari()) {
      await registration.update();
    }

    // Listen for new service worker installations
    return new Promise((resolve) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              resolve(true);
            }
          });
        }
      });

      // Shorter timeout for mobile
      setTimeout(() => resolve(false), isMobileSafari() ? 3000 : 5000);
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
};

/**
 * Apply pending service worker update with mobile optimization
 */
export const applyUpdate = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'APPLY_UPDATE' });
      
      // Wait for the new service worker to take control
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve();
        }, { once: true });
        
        // Shorter timeout for mobile
        setTimeout(() => resolve(), isMobileSafari() ? 2000 : 5000);
      });
      
      // Reload the page to get the new version
      window.location.reload();
    }
  } catch (error) {
    console.error('Error applying update:', error);
    // Fallback to simple reload
    window.location.reload();
  }
};

/**
 * Clear all caches manually with mobile Safari specific handling
 */
export const clearAllCaches = async (): Promise<void> => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Additional mobile Safari cache clearing
    if (isMobileSafari()) {
      // Force reload to clear Safari's additional caches
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
    
    console.log('All caches cleared');
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
};

/**
 * Pre-warm cache with critical resources
 */
export const preWarmCache = async (): Promise<void> => {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open(`offer-alert-${CACHE_VERSION}`);
    const criticalResources = [
      '/',
      '/index.html',
      '/manifest.json'
    ];

    await Promise.all(
      criticalResources.map(resource => 
        fetch(resource).then(response => {
          if (response.ok) {
            return cache.put(resource, response);
          }
        }).catch(() => {
          // Ignore pre-warming failures
        })
      )
    );
  } catch (error) {
    console.error('Error pre-warming cache:', error);
  }
};

/**
 * Get current cache status with mobile info
 */
export const getCacheStatus = async (): Promise<{
  cacheNames: string[];
  currentVersion: string;
  hasUpdate: boolean;
  isMobileSafari: boolean;
}> => {
  try {
    const cacheNames = 'caches' in window ? await caches.keys() : [];
    const hasUpdate = await checkForUpdates();
    
    return {
      cacheNames,
      currentVersion: CACHE_VERSION,
      hasUpdate,
      isMobileSafari: isMobileSafari()
    };
  } catch (error) {
    console.error('Error getting cache status:', error);
    return {
      cacheNames: [],
      currentVersion: CACHE_VERSION,
      hasUpdate: false,
      isMobileSafari: isMobileSafari()
    };
  }
};
