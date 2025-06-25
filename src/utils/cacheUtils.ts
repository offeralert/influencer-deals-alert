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

// Track update state to prevent redundant checks
let updateCheckInProgress = false;
let lastUpdateCheck = 0;
const UPDATE_CHECK_COOLDOWN = 30000; // 30 seconds

/**
 * Check for service worker updates with enhanced detection
 */
export const checkForUpdates = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  // Prevent redundant checks
  const now = Date.now();
  if (updateCheckInProgress || (now - lastUpdateCheck) < UPDATE_CHECK_COOLDOWN) {
    console.log('Update check skipped - too frequent');
    return false;
  }

  updateCheckInProgress = true;
  lastUpdateCheck = now;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      updateCheckInProgress = false;
      return false;
    }

    // Check if there's a waiting service worker (most reliable indicator)
    if (registration.waiting) {
      console.log('Update available - service worker waiting');
      updateCheckInProgress = false;
      return true;
    }

    // Force update check but don't immediately assume there's an update
    await registration.update();

    // Only check server version if we don't have a waiting worker
    let hasServerVersionUpdate = false;
    try {
      const versionResponse = await fetch('/version.json?' + Date.now());
      if (versionResponse.ok) {
        const serverVersion = await versionResponse.json();
        const currentVersion = localStorage.getItem('app-version');
        
        if (currentVersion && currentVersion !== serverVersion.version) {
          console.log('Server version differs:', { current: currentVersion, server: serverVersion.version });
          localStorage.setItem('app-version', serverVersion.version);
          hasServerVersionUpdate = true;
        }
        
        if (!currentVersion) {
          localStorage.setItem('app-version', serverVersion.version);
        }
      }
    } catch (error) {
      console.log('Could not check server version:', error);
    }

    // Listen for new service worker installations with timeout
    const hasNewWorker = await new Promise<boolean>((resolve) => {
      let resolved = false;
      
      const handleUpdateFound = () => {
        if (resolved) return;
        
        const newWorker = registration.installing;
        if (newWorker) {
          const handleStateChange = () => {
            if (resolved) return;
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              resolved = true;
              resolve(true);
            }
          };
          
          newWorker.addEventListener('statechange', handleStateChange);
        }
      };

      registration.addEventListener('updatefound', handleUpdateFound);

      // Shorter timeout for mobile, and resolve false instead of hanging
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(hasServerVersionUpdate);
        }
      }, isMobileSafari() ? 3000 : 5000);
    });

    updateCheckInProgress = false;
    return hasNewWorker;
  } catch (error) {
    console.error('Error checking for updates:', error);
    updateCheckInProgress = false;
    return false;
  }
};

/**
 * Apply pending service worker update - only reload when there's actually an update
 */
export const applyUpdate = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    // Only apply update if there's actually a waiting service worker
    if (registration?.waiting) {
      console.log('Applying service worker update');
      
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'APPLY_UPDATE' });
      
      // Wait for the new service worker to take control
      await new Promise<void>((resolve) => {
        const handleControllerChange = () => {
          console.log('New service worker took control');
          resolve();
        };
        
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange, { once: true });
        
        // Timeout to prevent hanging
        setTimeout(() => resolve(), isMobileSafari() ? 2000 : 5000);
      });
      
      // Reload the page to get the new version
      console.log('Reloading for update');
      window.location.reload();
    } else {
      // No waiting worker - don't reload unnecessarily
      console.log('No pending update to apply');
    }
  } catch (error) {
    console.error('Error applying update:', error);
    // Only fallback to cache-busting reload if explicitly requested by user
    throw error;
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
