
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

    fetchFollowerCount();
  }, [influencerId]);

  return { followerCount, isLoading };
};
