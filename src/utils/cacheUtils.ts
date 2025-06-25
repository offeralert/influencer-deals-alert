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

// Track update state to prevent redundant checks - MUCH more conservative now
let updateCheckInProgress = false;
let lastUpdateCheck = 0;
let consecutiveUpdateDetections = 0;
let lastDetectedVersion = '';
const UPDATE_CHECK_COOLDOWN = 5 * 60 * 1000; // Increased to 5 minutes
const MINIMUM_VERSION_AGE = 2 * 60 * 1000; // 2 minutes - don't trust versions newer than this
const REQUIRED_CONSECUTIVE_DETECTIONS = 2; // Require 2 consecutive detections before showing update

// Session-based update throttling
const SESSION_STORAGE_KEY = 'update_notifications_shown';
const MAX_UPDATES_PER_SESSION = 1;

/**
 * Check for service worker updates with much more conservative detection
 */
export const checkForUpdates = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  // Prevent redundant checks with much longer cooldown
  const now = Date.now();
  if (updateCheckInProgress || (now - lastUpdateCheck) < UPDATE_CHECK_COOLDOWN) {
    console.log('Update check skipped - cooldown active for', Math.round((UPDATE_CHECK_COOLDOWN - (now - lastUpdateCheck)) / 1000), 'more seconds');
    return false;
  }

  // Check session-based throttling
  const sessionsUpdatesShown = parseInt(sessionStorage.getItem(SESSION_STORAGE_KEY) || '0');
  if (sessionsUpdatesShown >= MAX_UPDATES_PER_SESSION) {
    console.log('Update check skipped - maximum updates per session reached');
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
      consecutiveUpdateDetections++;
      
      // Require multiple consecutive detections
      if (consecutiveUpdateDetections >= REQUIRED_CONSECUTIVE_DETECTIONS) {
        updateCheckInProgress = false;
        return true;
      } else {
        console.log(`Update detected but requires ${REQUIRED_CONSECUTIVE_DETECTIONS - consecutiveUpdateDetections} more confirmations`);
        updateCheckInProgress = false;
        return false;
      }
    }

    // Much more conservative server version checking
    let hasServerVersionUpdate = false;
    try {
      const versionResponse = await fetch('/version.json?' + Date.now(), {
        cache: 'no-store', // Don't cache this request
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      if (versionResponse.ok) {
        const serverVersion = await versionResponse.json();
        const currentVersion = localStorage.getItem('app-version');
        
        // Only consider it an update if:
        // 1. We have a current version to compare against
        // 2. The server version is actually different
        // 3. The version isn't too new (might be a timing issue)
        // 4. This version hasn't been detected before recently
        if (currentVersion && 
            currentVersion !== serverVersion.version && 
            serverVersion.buildTime && 
            (now - new Date(serverVersion.buildTime).getTime()) > MINIMUM_VERSION_AGE &&
            lastDetectedVersion !== serverVersion.version) {
          
          console.log('Server version differs and is mature enough:', { 
            current: currentVersion, 
            server: serverVersion.version,
            buildAge: Math.round((now - new Date(serverVersion.buildTime).getTime()) / 1000 / 60) + ' minutes'
          });
          
          lastDetectedVersion = serverVersion.version;
          localStorage.setItem('app-version', serverVersion.version);
          hasServerVersionUpdate = true;
        }
        
        if (!currentVersion) {
          localStorage.setItem('app-version', serverVersion.version);
          lastDetectedVersion = serverVersion.version;
        }
      }
    } catch (error) {
      console.log('Could not check server version (this is normal):', error.message);
      // Don't treat network errors as updates
    }

    // Only proceed with service worker update check if we don't have server version update
    if (!hasServerVersionUpdate) {
      // Force update check but with much longer timeout
      await registration.update();
    }

    // Listen for new service worker installations with longer timeout
    const hasNewWorker = await new Promise<boolean>((resolve) => {
      let resolved = false;
      
      const handleUpdateFound = () => {
        if (resolved) return;
        
        const newWorker = registration.installing;
        if (newWorker) {
          const handleStateChange = () => {
            if (resolved) return;
            
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              consecutiveUpdateDetections++;
              resolved = true;
              
              // Require multiple consecutive detections for service worker updates too
              resolve(consecutiveUpdateDetections >= REQUIRED_CONSECUTIVE_DETECTIONS);
            }
          };
          
          newWorker.addEventListener('statechange', handleStateChange);
        }
      };

      registration.addEventListener('updatefound', handleUpdateFound);

      // Much longer timeout, and always default to false for conservative behavior
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          // FIXED: Always resolve false on timeout instead of hasServerVersionUpdate
          resolve(false);
        }
      }, isMobileSafari() ? 8000 : 15000); // Longer timeouts
    });

    updateCheckInProgress = false;
    
    // Reset consecutive detections if no update found
    if (!hasNewWorker && !hasServerVersionUpdate) {
      consecutiveUpdateDetections = 0;
      lastDetectedVersion = '';
    }
    
    return hasNewWorker || (hasServerVersionUpdate && consecutiveUpdateDetections >= REQUIRED_CONSECUTIVE_DETECTIONS);
  } catch (error) {
    console.error('Error checking for updates:', error);
    updateCheckInProgress = false;
    consecutiveUpdateDetections = 0; // Reset on error
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
    // Track that we're showing an update to this session
    const currentCount = parseInt(sessionStorage.getItem(SESSION_STORAGE_KEY) || '0');
    sessionStorage.setItem(SESSION_STORAGE_KEY, (currentCount + 1).toString());
    
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
        
        // Longer timeout to prevent hanging
        setTimeout(() => resolve(), isMobileSafari() ? 3000 : 8000);
      });
      
      // Reset detection counters before reload
      consecutiveUpdateDetections = 0;
      lastDetectedVersion = '';
      
      // Reload the page to get the new version
      console.log('Reloading for confirmed update');
      window.location.reload();
    } else {
      // No waiting worker - don't reload unnecessarily
      console.log('No pending update to apply - not reloading');
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
    
    // Clear sessionStorage including update tracking
    sessionStorage.clear();
    
    // Reset update detection state
    consecutiveUpdateDetections = 0;
    lastDetectedVersion = '';
    lastUpdateCheck = 0;
    
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
    // Reset cooldown for forced check
    lastUpdateCheck = 0;
    consecutiveUpdateDetections = 0;
    
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
  consecutiveDetections: number;
  sessionUpdatesShown: number;
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
      serviceWorkerStatus,
      consecutiveDetections: consecutiveUpdateDetections,
      sessionUpdatesShown: parseInt(sessionStorage.getItem(SESSION_STORAGE_KEY) || '0')
    };
  } catch (error) {
    console.error('Error getting cache status:', error);
    return {
      cacheNames: [],
      currentVersion: CACHE_VERSION,
      hasUpdate: false,
      isMobileSafari: isMobileSafari(),
      serviceWorkerStatus: 'error',
      consecutiveDetections: 0,
      sessionUpdatesShown: 0
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
