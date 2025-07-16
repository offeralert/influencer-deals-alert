
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const usePromoCodeCounts = (managedInfluencers: any[]) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for promo codes changes
  useEffect(() => {
    const influencerIds = managedInfluencers
      ?.map(inf => inf.influencer_profile?.id)
      .filter(Boolean);

    if (!influencerIds?.length) return;

    const channel = supabase
      .channel('promo-codes-counts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'promo_codes'
        },
        (payload) => {
          console.log('Promo codes changed, invalidating counts cache...');
          queryClient.invalidateQueries({ queryKey: ['influencer-promo-counts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [managedInfluencers, queryClient]);

  return useQuery({
    queryKey: ['influencer-promo-counts', managedInfluencers?.map(inf => inf.influencer_profile?.id)],
    queryFn: async () => {
      if (!managedInfluencers?.length) return {};

      const influencerIds = managedInfluencers
        .map(inf => inf.influencer_profile?.id)
        .filter(Boolean);

      if (influencerIds.length === 0) return {};

      const { data, error } = await supabase
        .from('promo_codes')
        .select('influencer_id')
        .in('influencer_id', influencerIds);

      if (error) throw error;

      // Count promo codes per influencer
      const counts: Record<string, number> = {};
      data?.forEach(pc => {
        counts[pc.influencer_id] = (counts[pc.influencer_id] || 0) + 1;
      });

      return counts;
    },
    enabled: !!managedInfluencers?.length,
  });
};
