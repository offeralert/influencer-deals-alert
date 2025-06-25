
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Aggressive cache management to ensure users see the latest version
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none' // Force fresh network requests for service worker updates
      });
      
      console.log('Service Worker registered:', registration);
      
      // Immediately check for updates to ensure latest version
      await registration.update();
      
      // Force reload if there's a waiting service worker (new version available)
      if (registration.waiting) {
        console.log('New version available, forcing update...');
        registration.waiting.postMessage({ type: 'APPLY_UPDATE' });
        
        // Wait for the new service worker to take control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        }, { once: true });
      }
      
      // Listen for new service worker installations
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New version installed, reloading...');
              window.location.reload();
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Clear old caches on startup to ensure fresh content
const clearOldCaches = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.startsWith('offer-alert-') && !name.includes(Date.now().toString().slice(0, -3))
      );
      
      await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));
      console.log('Cleared old caches:', oldCaches);
    } catch (error) {
      console.error('Error clearing old caches:', error);
    }
  }
};

// Add cache busting to critical resources
const addCacheBusting = () => {
  const version = Date.now();
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.includes('?v=')) {
      link.setAttribute('href', `${href}?v=${version}`);
    }
  });
};

// Initialize the app with aggressive cache management
const initApp = async () => {
  // Clear old caches first
  await clearOldCaches();
  
  // Add cache busting to resources
  addCacheBusting();
  
  // Register service worker
  await registerServiceWorker();
  
  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
};

initApp();
