
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useFollowerCount } from '@/hooks/useFollowerCount';
import { UserRound } from 'lucide-react';

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category?: string;
  followers?: number;
}

const InfluencerCard = ({ id, name, username, imageUrl, category }: InfluencerCardProps) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const followerCount = useFollowerCount(id);

  const toggleFollow = async () => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('influencer_id', id);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            user_id: user.id,
            influencer_id: id
          });

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  const checkFollowingStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('user_id', user.id)
        .eq('influencer_id', id)
        .maybeSingle();
      
      if (!error && data) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  // Add real-time subscription for follow status
  useEffect(() => {
    if (!user) return;

    checkFollowingStatus();
    
    const channel = supabase
      .channel('follow-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `user_id=eq.${user.id} AND influencer_id=eq.${id}`
        },
        () => {
          checkFollowingStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, id]);

  return (
    <Card className="overflow-hidden">
      <Link to={`/influencer/${id}`}>
        <CardContent className="p-6 flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
          <p className="text-gray-500 mb-2">@{username}</p>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <UserRound className="h-4 w-4 mr-1" />
            <span>{followerCount} followers</span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4">
        <Button 
          onClick={toggleFollow} 
          variant={isFollowing ? "outline" : "default"} 
          className="w-full"
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InfluencerCard;
