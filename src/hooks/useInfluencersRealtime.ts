import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Influencer, SortOption } from "@/types/explore";

export const useInfluencersRealtime = (
  sortOption: SortOption,
  searchQuery: string = ""
) => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInfluencers = async () => {
    console.log('[INFLUENCERS] Starting fetchInfluencers...');
    
    try {
      // First get all unique influencer IDs from promo codes
      const { data: promoCodeData, error: promoError } = await supabase
        .from('promo_codes')
        .select('influencer_id');

      if (promoError) {
        console.error("[INFLUENCERS] Error fetching promo code influencers:", promoError);
        setInfluencers([]);
        return;
      }

      console.log(`[INFLUENCERS] Found ${promoCodeData?.length || 0} promo codes`);
      
      // Extract unique influencer IDs
      const influencerIds = [...new Set(promoCodeData?.map(p => p.influencer_id) || [])];
      console.log(`[INFLUENCERS] Unique influencer IDs: ${influencerIds.length}`);

      if (influencerIds.length === 0) {
        console.log('[INFLUENCERS] No influencer IDs found, setting empty array');
        setInfluencers([]);
        return;
      }

      // Now fetch only those influencers who have promo codes
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('is_agency', true)
        .neq('is_creditcard', true)
        .in('id', influencerIds)
        .order(sortOption === 'alphabetical' ? 'full_name' : 'created_at', 
               { ascending: sortOption === 'alphabetical' });
      
      if (error) {
        console.error("[INFLUENCERS] Error fetching influencers:", error);
        setInfluencers([]);
        return;
      }
      
      console.log(`[INFLUENCERS] Fetched ${data?.length || 0} influencer profiles`);
      
      const formattedInfluencers = data?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unnamed Influencer',
        username: profile.username || 'unknown',
        avatar_url: profile.avatar_url,
        is_creditcard: profile.is_creditcard
      })) || [];
      
      // Filter by search query if provided
      const filtered = searchQuery
        ? formattedInfluencers.filter(inf => 
            inf.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inf.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : formattedInfluencers;
      
      console.log(`[INFLUENCERS] Final influencers count after filtering: ${filtered.length}`);
      setInfluencers(filtered);
    } catch (error) {
      console.error("[INFLUENCERS] Error in fetchInfluencers:", error);
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchInfluencers();

    // Set up real-time subscriptions for both promo_codes and profiles
    const promoCodesChannel = supabase
      .channel('promo-codes-influencers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'promo_codes'
        },
        () => {
          console.log('Promo codes changed, refetching influencers...');
          fetchInfluencers();
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-influencers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile changed:', payload);
          fetchInfluencers();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(promoCodesChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [sortOption, searchQuery]);

  return { influencers, loading, refetch: fetchInfluencers };
};