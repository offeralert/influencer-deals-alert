
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface InfluencerProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  followers_count: number;
}

interface PromoCode {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date: string | null;
  affiliate_link: string | null;
  category: string;
}

const InfluencerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [influencer, setInfluencer] = useState<InfluencerProfile | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    fetchInfluencerData();
    fetchPromoCodes();
    
    if (user) {
      checkFollowingStatus();
    }
  }, [id, user]);

  const fetchInfluencerData = async () => {
    try {
      setLoading(true);
      
      // Fetch influencer profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('is_influencer', true)
        .single();
      
      if (profileError) {
        console.error("Error fetching influencer profile:", profileError);
        navigate("/not-found");
        return;
      }
      
      // Count followers
      const { count, error: countError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('influencer_id', id);
      
      if (!countError) {
        setFollowersCount(count || 0);
      }
      
      setInfluencer({
        id: profileData.id,
        full_name: profileData.full_name || 'Unnamed Influencer',
        username: profileData.username || 'influencer',
        avatar_url: profileData.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        followers_count: count || 0
      });
      
    } catch (error) {
      console.error("Error in fetchInfluencerData:", error);
      navigate("/not-found");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching promo codes:", error);
        return;
      }
      
      setPromoCodes(data || []);
    } catch (error) {
      console.error("Error in fetchPromoCodes:", error);
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

  const handleFollowToggle = async () => {
    if (!user) {
      navigate("/login");
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
          description: `You are no longer following ${influencer?.full_name}`,
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
          description: `You're now following ${influencer?.full_name}`,
        });
      }
    } catch (error) {
      console.error("Error in handleFollowToggle:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading influencer profile...</p>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Influencer not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={influencer.avatar_url} alt={influencer.full_name} />
              <AvatarFallback>{influencer.full_name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">{influencer.full_name}</h1>
              <p className="text-muted-foreground mb-3">@{influencer.username}</p>
              
              <div className="flex justify-center md:justify-start items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{followersCount} followers</span>
              </div>
              
              <Button 
                variant={isFollowing ? "outline" : "default"}
                className="min-w-[120px]"
                onClick={handleFollowToggle}
              >
                {isFollowing ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  "Follow"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Promo Codes & Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {promoCodes.length > 0 ? (
            <div className="space-y-4">
              {promoCodes.map((promoCode) => (
                <Card key={promoCode.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{promoCode.brand_name}</h3>
                        <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-medium">
                          {promoCode.promo_code}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{promoCode.description}</p>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-muted-foreground">
                          Expires: {formatDate(promoCode.expiration_date)}
                        </div>
                        
                        {promoCode.affiliate_link && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={promoCode.affiliate_link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              Shop <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                          {promoCode.category}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                This influencer hasn't shared any promo codes yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerProfile;
