
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category: string;
  followers: number;
  isFollowing?: boolean;
}

const InfluencerCard = ({
  id,
  name,
  username,
  imageUrl,
  category,
  followers,
  isFollowing = false,
}: InfluencerCardProps) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check if user is following this influencer
    const checkFollowStatus = async () => {
      if (!user) return;
      
      try {
        // We need to call the raw table name since follows is not in the types yet
        const { data, error } = await supabase
          .from('follows')
          .select('*')
          .eq('user_id', user.id)
          .eq('influencer_id', id)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking follow status:", error);
          return;
        }
        
        setFollowing(!!data);
      } catch (error) {
        console.error("Error in checkFollowStatus:", error);
      }
    };
    
    checkFollowStatus();
  }, [user, id]);
  
  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please sign in to follow influencers");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!following) {
        // Follow the influencer using raw table name
        const { error } = await supabase
          .from('follows')
          .insert({
            user_id: user.id,
            influencer_id: id
          });
        
        if (error) {
          console.error("Error following influencer:", error);
          toast.error("Failed to follow influencer");
          return;
        }
        
        setFollowing(true);
        toast.success(`You are now following ${name}`, {
          description: "You'll see their deals in your feed."
        });
      } else {
        // Unfollow the influencer using raw table name
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('influencer_id', id);
        
        if (error) {
          console.error("Error unfollowing influencer:", error);
          toast.error("Failed to unfollow influencer");
          return;
        }
        
        setFollowing(false);
        toast.info(`You've unfollowed ${name}`);
      }
    } catch (error) {
      console.error("Error in handleFollow:", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Link to={`/influencer/${id}`}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="relative pb-[100%]">
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>
            <Button
              variant={following ? "secondary" : "default"}
              size="sm"
              className={following ? "text-brand-pink" : ""}
              onClick={handleFollow}
              disabled={isLoading}
            >
              {following ? (
                <>
                  <UserCheck className="mr-1 h-4 w-4" />
                  Following
                </>
              ) : (
                "Follow"
              )}
            </Button>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">{category}</span>
            <span className="font-medium">{formatFollowers(followers)} followers</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default InfluencerCard;
