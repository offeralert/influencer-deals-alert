
// Dynamic cache version from build
export const CACHE_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1';

/**
 * Adds cache busting parameter to a URL
 */
export const addCacheBuster = (url: string, version: string = CACHE_VERSION): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}&t=${Date.now()}`;
};

/**
 * Check for service worker updates without forcing refresh
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

      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
};

/**
 * Apply pending service worker update
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
 * Clear all caches manually (for troubleshooting)
 */
export const clearAllCaches = async (): Promise<void> => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    console.log('All caches cleared');
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
};

/**
 * Get current cache status
 */
export const getCacheStatus = async (): Promise<{
  cacheNames: string[];
  currentVersion: string;
  hasUpdate: boolean;
}> => {
  try {
    const cacheNames = 'caches' in window ? await caches.keys() : [];
    const hasUpdate = await checkForUpdates();
    
    return {
      cacheNames,
      currentVersion: CACHE_VERSION,
      hasUpdate
    };
  } catch (error) {
    console.error('Error getting cache status:', error);
    return {
      cacheNames: [],
      currentVersion: CACHE_VERSION,
      hasUpdate: false
    };
  }
};
