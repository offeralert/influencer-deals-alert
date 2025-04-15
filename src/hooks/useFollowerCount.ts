
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFollowerCount = (influencerId: string) => {
  const [followerCount, setFollowerCount] = useState<number>(0);

  useEffect(() => {
    fetchFollowerCount();
    
    // Subscribe to changes in the follows table
    const channel = supabase
      .channel('follower-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
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
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('influencer_id', influencerId);
    
    if (error) {
      console.error('Error fetching follower count:', error);
      return;
    }
    
    setFollowerCount(count || 0);
  };

  return followerCount;
};
