
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Influencer, SortOption } from "@/types/explore";

export const useInfluencersData = (
  sortOption: SortOption,
  searchQuery: string = ""
) => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfluencers = async () => {
      setLoading(true);
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
          .eq('is_influencer', true)
          .eq('is_creditcard', false)
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
    
    fetchInfluencers();
  }, [sortOption, searchQuery]);

  return { influencers, loading };
};
