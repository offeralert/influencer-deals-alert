
import { useEffect, useCallback, startTransition } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enrichEventData } from '@/utils/metaTrackingHelpers';

export type MetaEventName = 
  | 'PageView'
  | 'InfluencerSignup' 
  | 'SubscriptionInitiated'
  | 'SubscriptionComplete'
  | 'InitiateCheckout'
  | 'ViewContent'
  | 'Lead'
  | string;

export interface MetaEventParams {
  [key: string]: any;
}

export const useDeferredMetaTracking = () => {
  // Track page view after LCP, not on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.fbq) {
        startTransition(() => {
          window.fbq('track', 'PageView');
          console.log('[Meta Pixel] Deferred PageView tracked');
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const trackEvent = useCallback((eventName: MetaEventName, params?: MetaEventParams) => {
    startTransition(() => {
      if (window.fbq) {
        try {
          const enrichedParams = params ? enrichEventData(params) : undefined;
          window.fbq('track', eventName, enrichedParams);
          console.log(`[Meta Pixel] Event tracked: ${eventName}`, enrichedParams);
        } catch (error) {
          console.error(`[Meta Pixel] Error tracking ${eventName}:`, error);
        }
      }
    });
  }, []);

  const trackServerEvent = useCallback((eventName: MetaEventName, params?: MetaEventParams) => {
    return new Promise<boolean>((resolve) => {
      startTransition(() => {
        const performServerTracking = async () => {
          try {
            const sourceUrl = window.location.href;
            const enrichedParams = params ? enrichEventData(params) : {};
            
            const { data, error } = await supabase.functions.invoke('meta-conversion-api', {
              body: {
                eventName,
                eventData: {
                  sourceUrl,
                  customData: enrichedParams,
                  userData: {}
                }
              }
            });

            if (error) {
              console.error('[Meta Server Tracking] Error:', error);
              resolve(false);
              return;
            }

            console.log('[Meta Server Tracking] Success:', data);
            resolve(true);
          } catch (error) {
            console.error('[Meta Server Tracking] Exception:', error);
            resolve(false);
          }
        };

        performServerTracking();
      });
    });
  }, []);

  const track = useCallback(async (eventName: MetaEventName, params?: MetaEventParams) => {
    trackEvent(eventName, params);
    await trackServerEvent(eventName, params);
  }, [trackEvent, trackServerEvent]);

  return {
    trackEvent,
    trackServerEvent,
    track,
  };
};

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}
