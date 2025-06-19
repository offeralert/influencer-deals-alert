
// Get the app version from build-time definition
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : Date.now().toString();
const BUILD_MODE = typeof __BUILD_MODE__ !== 'undefined' ? __BUILD_MODE__ : 'development';

// Cache busting utilities
export const CACHE_VERSION = APP_VERSION;

/**
 * Adds cache busting parameter to a URL
 */
export const addCacheBuster = (url: string, version: string = CACHE_VERSION): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${version}`;
};

/**
 * Forces a hard refresh by reloading the page with cache disabled
 */
export const forceRefresh = (): void => {
  // Clear localStorage version to force update check
  localStorage.removeItem('app-version');
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
    
    // Clear localStorage
    localStorage.removeItem('app-version');
    
    // Force reload with cache disabled
    window.location.reload();
  } catch (error) {
    console.error('Error clearing cache:', error);
    window.location.reload();
  }
};

/**
 * Checks if the app version has changed and prompts for update
 */
export const checkForUpdates = async (): Promise<void> => {
  try {
    // In development, skip version checking to avoid constant reloads
    if (BUILD_MODE === 'development') {
      console.log('Development mode: skipping version check');
      return;
    }

    const currentVersion = localStorage.getItem('app-version');
    const newVersion = CACHE_VERSION;
    
    console.log('Version check:', { currentVersion, newVersion });
    
    if (currentVersion && currentVersion !== newVersion) {
      console.log('New version detected, clearing cache and reloading');
      localStorage.setItem('app-version', newVersion);
      await clearCacheAndReload();
    } else if (!currentVersion) {
      // First time visit
      localStorage.setItem('app-version', newVersion);
      console.log('First visit, setting version:', newVersion);
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
};

/**
 * Initialize version checking on app load
 */
export const initializeVersionCheck = (): void => {
  // Check for updates when the app loads
  checkForUpdates();
  
  // Set up periodic version checks (every 5 minutes)
  if (BUILD_MODE === 'production') {
    setInterval(checkForUpdates, 5 * 60 * 1000);
  }
};
