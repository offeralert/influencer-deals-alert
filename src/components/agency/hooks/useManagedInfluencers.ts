
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export const useManagedInfluencers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('agency-influencers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agency_influencers',
          filter: `agency_id=eq.${user.id}`
        },
        () => {
          console.log('Agency influencers changed, invalidating cache...');
          queryClient.invalidateQueries({ queryKey: ['managed-influencers', user.id] });
          queryClient.invalidateQueries({ queryKey: ['influencer-promo-counts'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Profiles changed, invalidating managed influencers cache...');
          queryClient.invalidateQueries({ queryKey: ['managed-influencers', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

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
            is_agency,
            is_creditcard
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
