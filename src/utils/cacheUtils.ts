
// Aggressive cache version management
export const CACHE_VERSION = Date.now().toString();

/**
 * Adds cache busting parameter to a URL with aggressive versioning
 */
export const addCacheBuster = (url: string, version: string = CACHE_VERSION): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}&t=${Date.now()}`;
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
 * Aggressively check for updates with immediate detection
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

    // Check for version mismatch by comparing current page version
    const hasVersionMismatch = await checkVersionMismatch();
    if (hasVersionMismatch) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
};

/**
 * Check for version mismatch by fetching current index.html
 */
const checkVersionMismatch = async (): Promise<boolean> => {
  try {
    const response = await fetch('/index.html?v=' + Date.now(), {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
    if (!response.ok) {
      return false;
    }

    const html = await response.text();
    const currentVersion = extractVersionFromHtml(html);
    const cachedVersion = extractVersionFromHtml(document.documentElement.outerHTML);
    
    return currentVersion !== cachedVersion;
  } catch (error) {
    console.error('Error checking version mismatch:', error);
    return false;
  }
};

/**
 * Extract version information from HTML
 */
const extractVersionFromHtml = (html: string): string => {
  const match = html.match(/assets\/[^"']*-([^-"']+)\.(js|css)/);
  return match ? match[1] : 'unknown';
};

/**
 * Apply pending service worker update immediately
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
        
        // Short timeout for immediate update
        setTimeout(() => resolve(), 1000);
      });
    }
    
    // Force reload to get the new version
    window.location.reload();
  } catch (error) {
    console.error('Error applying update:', error);
    // Fallback to simple reload
    window.location.reload();
  }
};

/**
 * Aggressively clear all caches
 */
export const clearAllCaches = async (): Promise<void> => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Clear browser cache programmatically if possible
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        // Re-register after clearing
        await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          updateViaCache: 'none'
        });
      }
    }
    
    console.log('All caches cleared aggressively');
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
};

/**
 * Force refresh of critical resources
 */
export const forceRefreshCriticalResources = async (): Promise<void> => {
  const criticalUrls = [
    '/',
    '/index.html',
    '/manifest.json'
  ];

  try {
    await Promise.all(
      criticalUrls.map(url => 
        fetch(addCacheBuster(url), {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })
      )
    );
    console.log('Critical resources refreshed');
  } catch (error) {
    console.error('Error refreshing critical resources:', error);
  }
};

/**
 * Get cache status with version information
 */
export const getCacheStatus = async (): Promise<{
  cacheNames: string[];
  currentVersion: string;
  hasUpdate: boolean;
  needsRefresh: boolean;
}> => {
  try {
    const cacheNames = 'caches' in window ? await caches.keys() : [];
    const hasUpdate = await checkForUpdates();
    const needsRefresh = await checkVersionMismatch();
    
    return {
      cacheNames,
      currentVersion: CACHE_VERSION,
      hasUpdate,
      needsRefresh
    };
  } catch (error) {
    console.error('Error getting cache status:', error);
    return {
      cacheNames: [],
      currentVersion: CACHE_VERSION,
      hasUpdate: false,
      needsRefresh: false
    };
  }
};
