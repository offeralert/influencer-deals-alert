
// Cache busting utilities
export const CACHE_VERSION = '3';

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
  window.location.reload();
};

/**
 * Clears all cached data and reloads the page
 */
export const clearCacheAndReload = async (): Promise<void> => {
  try {
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }
    
    // Force reload
    window.location.reload();
  } catch (error) {
    console.error('Error clearing cache:', error);
    window.location.reload();
  }
};

/**
 * Checks if the app version has changed and prompts for update
 */
export const checkForUpdates = (): void => {
  // This can be used to check for app updates
  const currentVersion = localStorage.getItem('app-version');
  const newVersion = CACHE_VERSION;
  
  if (currentVersion && currentVersion !== newVersion) {
    if (confirm('A new version of the app is available. Update now?')) {
      localStorage.setItem('app-version', newVersion);
      clearCacheAndReload();
    }
  } else {
    localStorage.setItem('app-version', newVersion);
  }
};
