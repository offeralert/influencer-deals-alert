import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromoCodeWithInfluencer } from '@/utils/supabaseQueries';
import { toast } from '@/hooks/use-toast';

export const useGlobalPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCodeWithInfluencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchPromoCodes = async () => {
      try {
        const { data, error } = await supabase
          .from('promo_codes')
          .select(`
            *,
            profiles:influencer_id (
              full_name,
              username,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching promo codes:', error);
          toast({
            title: 'Error fetching promo codes',
            description: error.message,
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        setPromoCodes(data || []);
        console.log(`[REAL-TIME] Initial fetch: ${data?.length || 0} promo codes loaded`);
        setLoading(false);
      } catch (err) {
        console.error('Exception fetching promo codes:', err);
        setLoading(false);
      }
    };

    fetchPromoCodes();

    // Real-time subscription
    const channel = supabase
      .channel('promo-codes-real-time')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'promo_codes' },
        async (payload) => {
          console.log(`[REAL-TIME] Promo code ${payload.eventType}:`, payload);
          
          switch(payload.eventType) {
            case 'INSERT':
              // Fetch the complete record with profile data
              const { data: newRecord } = await supabase
                .from('promo_codes')
                .select(`
                  *,
                  profiles:influencer_id (
                    full_name,
                    username,
                    avatar_url
                  )
                `)
                .eq('id', payload.new.id)
                .single();

              if (newRecord) {
                setPromoCodes(prev => [newRecord, ...prev]);
                console.log(`[REAL-TIME] Added new promo code: ${newRecord.brand_name}`);
              }
              break;
              
            case 'UPDATE':
              // Fetch the updated record with profile data
              const { data: updatedRecord } = await supabase
                .from('promo_codes')
                .select(`
                  *,
                  profiles:influencer_id (
                    full_name,
                    username,
                    avatar_url
                  )
                `)
                .eq('id', payload.new.id)
                .single();

              if (updatedRecord) {
                setPromoCodes(prev => 
                  prev.map(pc => pc.id === payload.new.id ? updatedRecord : pc)
                );
                console.log(`[REAL-TIME] Updated promo code: ${updatedRecord.brand_name}`);
              }
              break;
              
            case 'DELETE':
              setPromoCodes(prev => prev.filter(pc => pc.id !== payload.old.id));
              console.log(`[REAL-TIME] Deleted promo code: ${payload.old.id}`);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log(`[REAL-TIME] Subscription status: ${status}`);
      });

    return () => {
      console.log('[REAL-TIME] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return { promoCodes, loading };
};