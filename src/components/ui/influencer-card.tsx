
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category: string;
  followers: number;
}

const InfluencerCard = ({
  id,
  name,
  username,
  imageUrl,
  category,
}: InfluencerCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFollowersCount();
    if (user) {
      checkFollowingStatus();
    }
  }, [user, id]);

  const fetchFollowersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('influencer_id', id);
      
      if (!error) {
        setFollowersCount(count || 0);
      }
    } catch (error) {
      console.error("Error fetching followers count:", error);
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

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to profile
    e.stopPropagation(); // Stop event bubbling
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to follow influencers",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('influencer_id', id);
        
        if (error) {
          console.error("Error unfollowing influencer:", error);
          toast({
            title: "Error",
            description: "Failed to unfollow. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${name}`,
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            user_id: user.id,
            influencer_id: id
          });
        
        if (error) {
          console.error("Error following influencer:", error);
          toast({
            title: "Error",
            description: "Failed to follow. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast({
          title: "Following",
          description: `You're now following ${name}`,
        });
      }
    } catch (error) {
      console.error("Error in handleFollowToggle:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    } else {
      return count.toString();
    }
  };

  return (
    <Link to={`/influencer/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground mb-1">@{username}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                <span>{formatFollowers(followersCount)} followers</span>
              </div>
              
              <div className="mt-3">
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollowToggle}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isFollowing ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Following
                    </>
                  ) : (
                    "Follow"
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full inline-block">
              {category}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default InfluencerCard;
