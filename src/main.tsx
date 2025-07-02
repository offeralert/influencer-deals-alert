
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    // Report Core Web Vitals
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('Performance metrics:', {
        FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        LCP: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
        DOMContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        LoadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      });
    }, 0);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
