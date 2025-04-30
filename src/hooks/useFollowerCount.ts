
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFollowerCount = (influencerId: string) => {
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch initial count
    fetchFollowerCount();
    
    // Subscribe to changes in the user_domain_map table
    const channel = supabase
      .channel('domain-follower-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_domain_map',
          filter: `influencer_id=eq.${influencerId}`
        },
        () => {
          // Refetch the count when any change occurs
          fetchFollowerCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [influencerId]);

  const fetchFollowerCount = async () => {
    try {
      setIsLoading(true);
      
      // Count distinct users who follow this influencer
      const { data, error } = await supabase
        .from('user_domain_map')
        .select('user_id')
        .eq('influencer_id', influencerId);
      
      if (error) {
        console.error('Error fetching follower count:', error);
        return;
      }
      
      // Count unique user_ids to get actual follower count
      const uniqueUsers = new Set(data.map(item => item.user_id));
      setFollowerCount(uniqueUsers.size);
    } catch (err) {
      console.error('Exception in fetchFollowerCount:', err);
      setFollowerCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  return { followerCount, isLoading };
};
