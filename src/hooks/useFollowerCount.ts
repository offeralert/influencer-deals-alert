
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFollowerCount = (influencerId: string) => {
  const [followerCount, setFollowerCount] = useState<number>(0);

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
      // Count distinct users who follow this influencer
      const { count, error } = await supabase
        .from('user_domain_map')
        .select('user_id', { count: 'exact', head: true })
        .eq('influencer_id', influencerId)
        .limit(1);
      
      if (error) {
        console.error('Error fetching follower count:', error);
        return;
      }
      
      setFollowerCount(count || 0);
    } catch (err) {
      console.error('Exception in fetchFollowerCount:', err);
      setFollowerCount(0);
    }
  };

  return followerCount;
};
