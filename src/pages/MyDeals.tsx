
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DealCard } from "@/components/ui/deal-card";

interface PromoCode {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date: string | null;
  affiliate_link: string | null;
  created_at: string;
  influencer_name: string;
  influencer_image: string;
}

interface FollowedInfluencer {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
}

const MyDeals = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("following");
  const [followedInfluencers, setFollowedInfluencers] = useState<FollowedInfluencer[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [savedDeals, setSavedDeals] = useState<PromoCode[]>([]);
  const [loadingInfluencers, setLoadingInfluencers] = useState(false);
  const [loadingDeals, setLoadingDeals] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Fetch followed influencers
  useEffect(() => {
    if (!user) return;
    
    const fetchFollowedInfluencers = async () => {
      setLoadingInfluencers(true);
      try {
        console.log("Fetching follows for user:", user.id);
        // Get user_id of influencers the current user follows using raw table name
        const { data: followsData, error: followsError } = await supabase
          .from('follows')
          .select('influencer_id')
          .eq('user_id', user.id);
        
        if (followsError) {
          console.error("Error fetching follows:", followsError);
          return;
        }
        
        console.log("Follows data:", followsData);
        
        if (!followsData || followsData.length === 0) {
          setLoadingInfluencers(false);
          return;
        }
        
        // Get profile information for those influencers
        const influencerIds = followsData.map(follow => follow.influencer_id);
        console.log("Influencer IDs to fetch:", influencerIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', influencerIds)
          .eq('is_influencer', true);
        
        if (profilesError) {
          console.error("Error fetching influencer profiles:", profilesError);
          return;
        }
        
        console.log("Profiles data:", profilesData);
        setFollowedInfluencers(profilesData || []);
        
        // Now fetch promo codes from these influencers
        if (profilesData && profilesData.length > 0) {
          fetchPromoCodes(profilesData.map(profile => profile.id));
        } else {
          setPromoCodes([]);
          setLoadingDeals(false);
        }
      } catch (error) {
        console.error("Error in fetchFollowedInfluencers:", error);
      } finally {
        setLoadingInfluencers(false);
      }
    };
    
    fetchFollowedInfluencers();
  }, [user]);
  
  // Fetch promo codes from followed influencers
  const fetchPromoCodes = async (influencerIds: string[]) => {
    if (!influencerIds.length) return;
    
    setLoadingDeals(true);
    try {
      console.log("Fetching promo codes for influencers:", influencerIds);
      
      // Get current date for expiration filtering
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('promo_codes')
        .select(`
          id, 
          brand_name, 
          promo_code, 
          description, 
          expiration_date, 
          affiliate_link, 
          created_at,
          user_id,
          profiles:user_id (
            id,
            full_name, 
            username,
            avatar_url
          )
        `)
        .in('user_id', influencerIds)
        .or(`expiration_date.gt.${today},expiration_date.is.null`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching promo codes:", error);
        return;
      }
      
      console.log("Promo codes raw data:", data);
      
      // Transform the data to match the PromoCode interface
      const formattedCodes = data.map(code => ({
        id: code.id,
        brand_name: code.brand_name,
        promo_code: code.promo_code,
        description: code.description,
        expiration_date: code.expiration_date,
        affiliate_link: code.affiliate_link || '#', // Provide default value
        created_at: code.created_at,
        influencer_name: code.profiles?.full_name || 'Unknown Influencer',
        influencer_image: code.profiles?.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
      }));
      
      console.log("Transformed promo codes:", formattedCodes);
      setPromoCodes(formattedCodes);
    } catch (error) {
      console.error("Error in fetchPromoCodes:", error);
    } finally {
      setLoadingDeals(false);
    }
  };

  // Set up realtime subscription to follows table
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('follows-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'follows',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log("Follows table changed:", payload);
        // Refresh the followed influencers when there's a change
        const fetchInfluencers = async () => {
          // Using raw table name since it's not in types yet
          const { data, error } = await supabase
            .from('follows')
            .select('influencer_id')
            .eq('user_id', user.id);
          
          if (error || !data) return;
          
          const influencerIds = data.map(follow => follow.influencer_id);
          
          if (influencerIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name, username, avatar_url')
              .in('id', influencerIds)
              .eq('is_influencer', true);
            
            setFollowedInfluencers(profilesData || []);
            fetchPromoCodes(influencerIds);
          } else {
            setFollowedInfluencers([]);
            setPromoCodes([]);
          }
        };
        
        fetchInfluencers();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (isLoading || loadingInfluencers) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Create formatted deals for DealCard component
  const dealsForDisplay = promoCodes.map(code => ({
    id: code.id,
    title: code.description,
    brandName: code.brand_name,
    imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9", // Placeholder image
    discount: code.promo_code,
    promoCode: code.promo_code,
    expiryDate: code.expiration_date || undefined,
    affiliateLink: code.affiliate_link || '#', // Ensure affiliate_link is not null
    influencerName: code.influencer_name,
    influencerImage: code.influencer_image
  }));

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Deals</h1>
      
      <Tabs defaultValue="following" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="following">
          {followedInfluencers.length > 0 ? (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Followed Influencers</h2>
                <div className="flex flex-wrap gap-2">
                  {followedInfluencers.map(influencer => (
                    <div key={influencer.id} className="flex items-center gap-2 bg-brand-light dark:bg-brand-dark p-2 rounded-full">
                      <div className="h-6 w-6 rounded-full overflow-hidden">
                        <img 
                          src={influencer.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'} 
                          alt={influencer.full_name || 'Influencer'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-sm">{influencer.full_name || '@' + influencer.username}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {loadingDeals ? (
                <div className="text-center py-8">Loading deals...</div>
              ) : dealsForDisplay.length > 0 ? (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Available Deals</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {dealsForDisplay.map(deal => (
                      <DealCard key={deal.id} {...deal} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-brand-paleGreen bg-opacity-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No deals available</h3>
                  <p className="text-gray-500 mb-4">
                    The influencers you follow haven't posted any deals yet
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-paleGreen bg-opacity-50 rounded-lg">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No followed influencers yet</h3>
              <p className="text-gray-500 mb-4">
                Follow your favorite influencers to see their deals here
              </p>
              <Button 
                variant="default" 
                onClick={() => navigate("/explore")}
                className="bg-brand-green hover:bg-brand-green/90"
              >
                Explore Influencers
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="saved">
          <div className="text-center py-16 bg-brand-paleGreen bg-opacity-50 rounded-lg">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No saved deals yet</h3>
            <p className="text-gray-500 mb-4">
              Save deals to access them quickly later
            </p>
            <Button 
              variant="default" 
              onClick={() => navigate("/explore")}
              className="bg-brand-green hover:bg-brand-green/90"
            >
              Explore Deals
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyDeals;
