
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePromoCodeCounts = (managedInfluencers: any[]) => {
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
