
/**
 * Version utilities for managing cache-busting and version checks
 */

// This timestamp will be different each time the app is built
export const BUILD_TIMESTAMP = Date.now();

// Check if the service worker has the latest version
export const checkServiceWorkerVersion = async (): Promise<string | null> => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Skip if no active worker
    if (!registration.active) return null;
    
    // Create a message channel to receive the response
    const messageChannel = new MessageChannel();
    
    // Create promise to wait for response
    const versionPromise = new Promise<string>((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };
    });
    
    // Send message to service worker
    registration.active.postMessage(
      { type: 'CHECK_VERSION' },
      [messageChannel.port2]
    );
    
    // Wait for response with timeout
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 1000);
    });
    
    return await Promise.race([versionPromise, timeoutPromise]);
  } catch (error) {
    console.error('Failed to check service worker version:', error);
    return null;
  }
};

// Update service worker if a new version is available
export const updateServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.waiting) {
      // If there's a waiting worker, tell it to take control
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to update service worker:', error);
    return false;
  }
};

// Add cache-busting parameter to a URL
export const addCacheBuster = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${BUILD_TIMESTAMP}`;
};
