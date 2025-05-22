
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Type definitions for Meta events
type MetaEventName = 
  | 'PageView'
  | 'InfluencerSignup' 
  | 'SubscriptionInitiated'
  | 'SubscriptionComplete'
  | 'ViewContent'
  | 'Lead'
  | string; // Allow for custom events

// Type for event parameters
interface MetaEventParams {
  [key: string]: any;
}

export const useMetaTracking = () => {
  // Track page view on component mount
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, []);

  // Client-side tracking function
  const trackEvent = (eventName: MetaEventName, params?: MetaEventParams) => {
    if (window.fbq) {
      window.fbq('track', eventName, params);
      console.log(`[Meta Pixel] Event tracked: ${eventName}`, params);
    } else {
      console.warn('[Meta Pixel] fbq not available. Event not tracked:', eventName);
    }
  };

  // Server-side tracking function (more reliable)
  const trackServerEvent = async (eventName: MetaEventName, params?: MetaEventParams) => {
    try {
      // Get the current page URL for source tracking
      const sourceUrl = window.location.href;
      
      // Call the Supabase edge function for server-side tracking
      const { data, error } = await supabase.functions.invoke('meta-conversion-api', {
        body: {
          eventName,
          eventData: {
            sourceUrl,
            customData: params,
            userData: {
              // You can add hashed identifiers here if available
              // Meta will handle proper anonymization
            }
          }
        }
      });

      if (error) {
        console.error('[Meta Server Tracking] Error:', error);
        return false;
      }

      console.log('[Meta Server Tracking] Success:', data);
      return true;
    } catch (error) {
      console.error('[Meta Server Tracking] Exception:', error);
      return false;
    }
  };

  // Combined tracking function - uses both client and server
  const track = async (eventName: MetaEventName, params?: MetaEventParams) => {
    // Always track on client-side first (faster)
    trackEvent(eventName, params);
    
    // Also track server-side for reliability
    await trackServerEvent(eventName, params);
  };

  return {
    trackEvent, // Client-side only (faster)
    trackServerEvent, // Server-side only (more reliable)
    track, // Both client and server (recommended)
  };
};

// Add a type declaration for window.fbq
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}
