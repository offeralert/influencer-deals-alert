
import { useEffect } from 'react';

export const useResourcePreloader = () => {
  useEffect(() => {
    // Preload critical resources after initial page load
    const preloadResources = () => {
      const criticalResources = [
        // Critical CSS and JS will be handled by Vite's module preloading
        '/manifest.json',
        '/favicon.ico',
      ];
      
      // Preload critical images
      const criticalImages = [
        '/lovable-uploads/edf0a8ab-4e46-4096-9778-1873148c2812.png', // Logo/icon
      ];
      
      // Create preload links for resources
      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
      });
      
      // Preload critical images
      criticalImages.forEach(imageSrc => {
        const img = new Image();
        img.src = imageSrc;
      });
    };
    
    // Delay preloading to not interfere with critical rendering
    const timer = setTimeout(preloadResources, 1000);
    
    return () => clearTimeout(timer);
  }, []);
};
