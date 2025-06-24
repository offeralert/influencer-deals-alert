
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useManagedInfluencers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['managed-influencers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('agency_influencers')
        .select(`
          id,
          created_at,
          managed_by_agency,
          temporary_password,
          influencer_profile:profiles!influencer_id (
            id,
            full_name,
            username,
            avatar_url,
            is_influencer
          )
        `)
        .eq('agency_id', user.id)
        .eq('managed_by_agency', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
};
