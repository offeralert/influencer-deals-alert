
import { useState, useEffect } from 'react';

export const useProgressiveEnhancement = () => {
  const [isEnhanced, setIsEnhanced] = useState(false);

  useEffect(() => {
    // Wait for LCP before enabling enhancements
    const timer = setTimeout(() => {
      setIsEnhanced(true);
    }, 2500); // Delay until after LCP

    return () => clearTimeout(timer);
  }, []);

  return isEnhanced;
};
