
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { checkServiceWorkerVersion, updateServiceWorker } from './utils/versionUtils';

// Initialize the app
const renderApp = () => {
  createRoot(document.getElementById("root")!).render(<App />);
};

// Register and manage service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none' // Never use the browser's HTTP cache for service worker
      });
      
      console.log('ServiceWorker registration successful with scope:', registration.scope);

      // Check for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;
        
        installingWorker.onstatechange = async () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available, show notification or reload
              console.log('New version available! Refreshing...');
              window.location.reload();
            }
          }
        };
      };
      
      // Check for updates every 30 minutes
      setInterval(() => {
        registration.update().catch(console.error);
      }, 30 * 60 * 1000);
      
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });

  // Handle updates when the user returns to the app after it's been idle
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) reg.update().catch(console.error);
      });
    }
  });
}

// Start the app
renderApp();
