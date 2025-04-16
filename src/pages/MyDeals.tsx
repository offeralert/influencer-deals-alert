
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/ui/deal-card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUniversalPromoCodes, UniversalPromoCode } from "@/utils/supabaseQueries";

interface SavedDeal {
  id: string;
  title: string;
  brandName: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
  influencerId: string; // Added this required field
  category: string;
}

const MyDeals = () => {
  const { user } = useAuth();
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedDeals();
      
      // Set up realtime subscription for follows table changes
      const followsChannel = supabase
        .channel('follows_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'follows',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchSavedDeals();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(followsChannel);
      };
    } else {
      setIsLoading(false);
      setSavedDeals([]);
    }
  }, [user]);

  const fetchSavedDeals = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setSavedDeals([]);
        return;
      }
      
      // Get all influencers that the user follows
      const { data: followedInfluencers, error: followError } = await supabase
        .from('follows')
        .select('influencer_id')
        .eq('user_id', user.id);
      
      if (followError) {
        console.error("Error fetching followed influencers:", followError);
        toast.error("Error loading your deals");
        setIsLoading(false);
        return;
      }
      
      if (!followedInfluencers || followedInfluencers.length === 0) {
        setSavedDeals([]);
        setIsLoading(false);
        return;
      }
      
      const influencerIds = followedInfluencers.map(follow => follow.influencer_id);
      
      // Get promo codes from followed influencers using the universal_promo_codes view
      const { data: promoCodes, error: promoError } = await getUniversalPromoCodes()
        .in('influencer_id', influencerIds)
        .order('created_at', { ascending: false });
      
      if (promoError) {
        console.error("Error fetching promo codes:", promoError);
        toast.error("Error loading promo codes");
        setIsLoading(false);
        return;
      }
      
      // Transform the data
      const deals = (promoCodes || []).map(promo => ({
        id: promo.id || "",
        title: promo.description || "",
        brandName: promo.brand_name || "",
        discount: promo.promo_code || "",
        promoCode: promo.promo_code || "",
        expiryDate: promo.expiration_date,
        affiliateLink: promo.affiliate_link || "#",
        influencerName: promo.influencer_name || 'Unknown Influencer',
        influencerImage: promo.influencer_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        influencerId: promo.influencer_id || "", // Ensure we include the influencer ID
        category: promo.category || ""
      }));
      
      setSavedDeals(deals);
    } catch (error) {
      console.error("Error fetching saved deals:", error);
      toast.error("Error loading your deals");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
          <p className="text-gray-500 mb-4">
            Create an account to save and follow your favorite deals from influencers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-brand-green hover:bg-brand-green/90">
              <Link to="/signup">Create Account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Saved Deals</h1>
      
      {isLoading ? (
        <div className="text-center py-16">
          <p>Loading your saved deals...</p>
        </div>
      ) : savedDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedDeals.map((deal) => (
            <DealCard
              key={deal.id}
              id={deal.id}
              title={deal.title}
              brandName={deal.brandName}
              discount={deal.discount}
              promoCode={deal.promoCode}
              expiryDate={deal.expiryDate}
              affiliateLink={deal.affiliateLink}
              influencerName={deal.influencerName}
              influencerImage={deal.influencerImage}
              influencerId={deal.influencerId} // Explicitly pass influencerId
              category={deal.category}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">You haven't saved any deals yet</h3>
          <p className="text-gray-500 mb-4">
            Follow influencers to see their deals here, or explore all deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/explore">Explore Deals</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/explore?tab=influencers">Find Influencers</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDeals;
