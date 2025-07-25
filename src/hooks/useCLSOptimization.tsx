import { useEffect } from 'react';

export const useCLSOptimization = () => {
  useEffect(() => {
    // Preload critical fonts to prevent layout shift
    const preloadFonts = () => {
      const fontPreloads = [
        'Inter',
        'system-ui',
        '-apple-system'
      ];

      fontPreloads.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };

    // Reserve space for dynamic content
    const reserveSpace = () => {
      // Add min-height to containers that load dynamic content
      const dynamicContainers = document.querySelectorAll('[data-dynamic-content]');
      dynamicContainers.forEach(container => {
        if (!container.getAttribute('style')?.includes('min-height')) {
          (container as HTMLElement).style.minHeight = '200px';
        }
      });
    };

    // Ensure images have proper dimensions
    const optimizeImages = () => {
      const images = document.querySelectorAll('img:not([width]):not([height])');
      images.forEach(img => {
        const element = img as HTMLImageElement;
        if (!element.width && !element.height) {
          element.style.aspectRatio = '16 / 9'; // Default aspect ratio
          element.style.width = '100%';
          element.style.height = 'auto';
        }
      });
    };

    const timer = setTimeout(() => {
      preloadFonts();
      reserveSpace();
      optimizeImages();
    }, 100);

    return () => clearTimeout(timer);
  }, []);
};