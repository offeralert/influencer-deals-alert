
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFollowerCount = (influencerId: string) => {
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!influencerId) {
      setIsLoading(false);
      return;
    }

    const fetchFollowerCount = async () => {
      try {
        setIsLoading(true);
        
        const { count, error } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('influencer_id', influencerId);

        if (error) {
          console.error('Error fetching follower count:', error);
          setFollowerCount(0);
        } else {
          setFollowerCount(count || 0);
        }
      } catch (error) {
        console.error('Error in fetchFollowerCount:', error);
        setFollowerCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchFollowerCount();

    // Set up real-time subscription
    const channel = supabase
      .channel('follower-count-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'follows',
          filter: `influencer_id=eq.${influencerId}`
        },
        () => {
          console.log('New follower detected, updating count');
          setFollowerCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'follows',
          filter: `influencer_id=eq.${influencerId}`
        },
        () => {
          console.log('Follower removed, updating count');
          setFollowerCount(prev => Math.max(0, prev - 1));
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      console.log('Cleaning up follower count subscription');
      supabase.removeChannel(channel);
    };
  }, [influencerId]);

  return { followerCount, isLoading };
};
