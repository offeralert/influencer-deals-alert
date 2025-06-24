
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = (enabled: boolean = true) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!enabled) return;
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname, enabled]);
};
