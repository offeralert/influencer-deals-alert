
// Get dynamic cache version from build
declare const __CACHE_VERSION__: string;
declare const __APP_VERSION__: string;

export const CACHE_VERSION = typeof __CACHE_VERSION__ !== 'undefined' ? __CACHE_VERSION__ : 'v' + Date.now();
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : Date.now().toString();

/**
 * Adds cache busting parameter to a URL
 */
export const addCacheBuster = (url: string, version: string = CACHE_VERSION): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version.replace('v', '')}`;
};

/**
 * Forces a hard refresh by reloading the page with cache disabled
 */
export const forceRefresh = (): void => {
  window.location.reload();
};

/**
 * Clears all cached data and reloads the page
 */
export const clearCacheAndReload = async (): Promise<void> => {
  try {
    console.log('Clearing all caches and reloading...');
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('Found caches:', cacheNames);
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          console.log('Unregistering service worker');
          return registration.unregister();
        })
      );
    }
    
    // Clear localStorage version tracking
    localStorage.removeItem('app-version');
    localStorage.removeItem('cache-version');
    
    // Force reload with cache bypass
    window.location.reload();
  } catch (error) {
    console.error('Error clearing cache:', error);
    window.location.reload();
  }
};

/**
 * Checks if the app version has changed and handles updates
 */
export const checkForUpdates = (): void => {
  const currentVersion = localStorage.getItem('app-version');
  const newVersion = APP_VERSION;
  
  console.log('Version check - Current:', currentVersion, 'New:', newVersion);
  
  if (currentVersion && currentVersion !== newVersion) {
    console.log('New version detected, clearing cache...');
    localStorage.setItem('app-version', newVersion);
    clearCacheAndReload();
  } else {
    localStorage.setItem('app-version', newVersion);
  }
};

/**
 * Detects version mismatches and prompts for updates
 */
export const detectVersionMismatch = async (): Promise<boolean> => {
  try {
    // Check if we have cached content with old version
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const currentCacheVersion = CACHE_VERSION;
      
      for (const cacheName of cacheNames) {
        if (!cacheName.includes(currentCacheVersion.replace('v', ''))) {
          console.log('Version mismatch detected in cache:', cacheName);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error detecting version mismatch:', error);
    return false;
  }
};

/**
 * Initialize cache management on app start
 */
export const initializeCacheManagement = (): void => {
  console.log('Initializing cache management with version:', CACHE_VERSION);
  
  // Check for updates on load
  checkForUpdates();
  
  // Detect version mismatches
  detectVersionMismatch().then(hasMismatch => {
    if (hasMismatch) {
      console.log('Cache version mismatch detected, clearing...');
      clearCacheAndReload();
    }
  });
};
