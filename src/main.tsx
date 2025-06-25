
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for caching and updates
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Check for updates immediately
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log('New service worker found, installing...');
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed, update available');
              // The useUpdateManager hook will handle the user notification
            }
          });
        }
      });
      
      // Force update check
      registration.update();
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Register service worker after DOM is ready
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
