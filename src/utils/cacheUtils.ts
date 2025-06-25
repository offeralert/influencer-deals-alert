
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
 * Check for service worker updates with enhanced detection
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

    // Force update check
    await registration.update();

    // Check version against server
    try {
      const versionResponse = await fetch('/version.json?' + Date.now());
      if (versionResponse.ok) {
        const serverVersion = await versionResponse.json();
        const currentVersion = localStorage.getItem('app-version');
        
        if (currentVersion && currentVersion !== serverVersion.version) {
          localStorage.setItem('app-version', serverVersion.version);
          return true;
        }
        
        if (!currentVersion) {
          localStorage.setItem('app-version', serverVersion.version);
        }
      }
    } catch (error) {
      console.log('Could not check server version:', error);
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
    } else {
      // No waiting worker, just reload to force update
      window.location.reload();
    }
  } catch (error) {
    console.error('Error applying update:', error);
    // Fallback to simple reload with cache busting
    window.location.href = window.location.href + '?v=' + Date.now();
  }
};

/**
 * Clear all caches manually with enhanced mobile Safari handling
 */
export const clearAllCaches = async (): Promise<void> => {
  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Clear localStorage version tracking
    localStorage.removeItem('app-version');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Additional mobile Safari cache clearing
    if (isMobileSafari()) {
      // Clear application cache if available (deprecated but still used in some cases)
      try {
        const appCache = (window as any).applicationCache;
        if (appCache && appCache.status !== appCache.UNCACHED) {
          appCache.update();
        }
      } catch (e) {
        // Ignore errors for deprecated applicationCache
      }
    }
    
    // Send message to service worker to clear its caches
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.active) {
        const messageChannel = new MessageChannel();
        
        return new Promise((resolve) => {
          messageChannel.port1.onmessage = () => resolve();
          registration.active?.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2]);
          
          // Resolve after timeout if no response
          setTimeout(() => resolve(), 2000);
        });
      }
    }
    
    console.log('All caches cleared');
  } catch (error) {
    console.error('Error clearing caches:', error);
    throw error;
  }
};

/**
 * Force immediate update check
 */
export const forceUpdateCheck = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return await checkForUpdates();
    }
    return false;
  } catch (error) {
    console.error('Error forcing update check:', error);
    return false;
  }
};

/**
 * Get current cache status with enhanced mobile info
 */
export const getCacheStatus = async (): Promise<{
  cacheNames: string[];
  currentVersion: string;
  hasUpdate: boolean;
  isMobileSafari: boolean;
  serviceWorkerStatus: string;
}> => {
  try {
    const cacheNames = 'caches' in window ? await caches.keys() : [];
    const hasUpdate = await checkForUpdates();
    
    let serviceWorkerStatus = 'not-supported';
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        if (registration.active) {
          serviceWorkerStatus = 'active';
        } else if (registration.installing) {
          serviceWorkerStatus = 'installing';
        } else if (registration.waiting) {
          serviceWorkerStatus = 'waiting';
        } else {
          serviceWorkerStatus = 'registered';
        }
      } else {
        serviceWorkerStatus = 'not-registered';
      }
    }
    
    return {
      cacheNames,
      currentVersion: CACHE_VERSION,
      hasUpdate,
      isMobileSafari: isMobileSafari(),
      serviceWorkerStatus
    };
  } catch (error) {
    console.error('Error getting cache status:', error);
    return {
      cacheNames: [],
      currentVersion: CACHE_VERSION,
      hasUpdate: false,
      isMobileSafari: isMobileSafari(),
      serviceWorkerStatus: 'error'
    };
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
