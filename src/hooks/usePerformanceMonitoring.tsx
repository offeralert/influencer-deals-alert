
import { useEffect } from 'react';

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Define proper types for performance entries
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  startTime: number;
}

export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observePerformance = () => {
      // LCP monitoring
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries() as LargestContentfulPaintEntry[];
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
          
          // Track in analytics (you can replace this with your preferred analytics)
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              name: 'LCP',
              value: Math.round(lastEntry.startTime),
              event_category: 'Web Vitals'
            });
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS monitoring
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0;
          const entries = entryList.getEntries() as LayoutShiftEntry[];
          
          for (const entry of entries) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          
          if (clsValue > 0) {
            console.log('CLS:', clsValue);
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                name: 'CLS',
                value: Math.round(clsValue * 1000),
                event_category: 'Web Vitals'
              });
            }
          }
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }
    };

    // Wait for page load to start monitoring
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observePerformance);
    } else {
      observePerformance();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', observePerformance);
    };
  }, []);
};
