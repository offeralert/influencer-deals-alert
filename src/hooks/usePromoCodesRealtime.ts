import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getPromoCodes, type PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { toast } from "sonner";

export const usePromoCodesRealtime = (targetInfluencerId?: string | null) => {
  const { user } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCodeWithInfluencer[]>([]);
  const [loading, setLoading] = useState(true);

  // Use targetInfluencerId if provided (for agency managing influencer), otherwise use current user
  const influencerId = targetInfluencerId || user?.id;

  const fetchPromoCodes = async () => {
    if (!influencerId) return;
    
    try {
      const { data, error } = await getPromoCodes()
        .eq('influencer_id', influencerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching promo codes:", error);
        toast.error("Failed to load promo codes");
        return;
      }
      
      setPromoCodes(data || []);
    } catch (error) {
      console.error("Error in fetchPromoCodes:", error);
      toast.error("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!influencerId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchPromoCodes();

    // Set up real-time subscription
    const channel = supabase
      .channel('promo-codes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'promo_codes',
          filter: `influencer_id=eq.${influencerId}`
        },
        (payload) => {
          console.log('Promo code change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new promo code
            setPromoCodes(prev => [payload.new as PromoCodeWithInfluencer, ...prev]);
            toast.success("New promo code added");
          } else if (payload.eventType === 'UPDATE') {
            // Update existing promo code
            setPromoCodes(prev => 
              prev.map(code => 
                code.id === payload.new.id 
                  ? { ...code, ...payload.new } as PromoCodeWithInfluencer
                  : code
              )
            );
            toast.success("Promo code updated");
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted promo code
            setPromoCodes(prev => prev.filter(code => code.id !== payload.old.id));
            toast.success("Promo code deleted");
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [influencerId]);

  return { promoCodes, loading, refetch: fetchPromoCodes };
};