
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

export const useDeferredPerformanceMonitoring = () => {
  useEffect(() => {
    // Defer performance monitoring to not block LCP
    const timer = setTimeout(() => {
      const observePerformance = () => {
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries() as LargestContentfulPaintEntry[];
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
            
            if (window.gtag) {
              window.gtag('event', 'web_vitals', {
                name: 'LCP',
                value: Math.round(lastEntry.startTime),
                event_category: 'Web Vitals'
              });
            }
          });
          
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

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

      observePerformance();
    }, 2000); // Delay by 2 seconds to ensure LCP has occurred

    return () => clearTimeout(timer);
  }, []);
};
