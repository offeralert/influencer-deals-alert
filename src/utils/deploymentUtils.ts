/**
 * Utility functions for deployment and cache management
 */

// Get deployment environment
export const getDeploymentEnvironment = () => {
  if (typeof window === 'undefined') return 'server';
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('vercel.app')) {
    return 'preview';
  }
  
  return 'production';
};

// Get current app version
export const getAppVersion = (): string => {
  return (window as any).__APP_VERSION__ || 'unknown';
};

// Force reload with cache bypass
export const forceReload = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
      window.location.reload();
    });
  } else {
    window.location.reload();
  }
};

// Check if running on Vercel
export const isVercelDeployment = (): boolean => {
  return typeof window !== 'undefined' && 
         (window.location.hostname.includes('vercel.app') || 
          window.location.hostname === 'offeralert.io');
};

// Get cache busting parameter for Vercel
export const getCacheBuster = (): string => {
  const version = getAppVersion();
  const timestamp = Date.now();
  return `v=${version}&t=${timestamp}`;
};