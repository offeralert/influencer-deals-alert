
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFollowerCount } from "@/hooks/useFollowerCount";

interface InfluencerCardProps {
  id: string;
  name: string;
  username: string;
  imageUrl: string;
  category?: string;
  followers?: number;
}

const InfluencerCard = ({
  id,
  name,
  username,
  imageUrl,
  category,
}: InfluencerCardProps) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const followerCount = useFollowerCount(id);
  
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
    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
      <Link to={`/influencer/${id}`} className="block h-full">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarImage src={imageUrl} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground mb-3">@{username}</p>
            
            {category && (
              <Badge variant="outline" className="mb-2">
                {category}
              </Badge>
            )}
            
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
              <Users className="h-3 w-3" />
              <span>{followerCount} {followerCount === 1 ? 'follower' : 'followers'}</span>
            </div>
            
            {user && user.id !== id && (
              <Button 
                variant={isFollowing ? "outline" : "default"} 
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Follow logic would go here
                }}
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
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export { InfluencerCard };
