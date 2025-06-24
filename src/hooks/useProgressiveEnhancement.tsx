
import { useState, useEffect } from 'react';

export const useProgressiveEnhancement = () => {
  const [isEnhanced, setIsEnhanced] = useState(false);

  useEffect(() => {
    // Reduce delay for faster loading - only wait for basic page load
    const timer = setTimeout(() => {
      setIsEnhanced(true);
    }, 1000); // Reduced from 2500ms to 1000ms

    return () => clearTimeout(timer);
  }, []);

  return isEnhanced;
};
