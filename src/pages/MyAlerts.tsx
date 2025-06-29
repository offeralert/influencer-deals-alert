import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/ui/deal-card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPromoCodes, PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import SearchBar from "@/components/ui/search-bar";
import { Download } from "lucide-react";

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
  influencerUsername: string;
  category: string;
}

const MyAlerts = () => {
  const { user } = useAuth();
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDeals, setFilteredDeals] = useState<SavedDeal[]>([]);

  useEffect(() => {
    if (user) {
      fetchSavedDeals();
      
      // Set up realtime subscription for user_domain_map table changes
      const followsChannel = supabase
        .channel('domain_map_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_domain_map',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchSavedDeals();
          }
        )
        .subscribe();
      
      // Also subscribe to promo_codes changes from followed influencers
      const promosChannel = supabase
        .channel('promo_codes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'promo_codes'
          },
          // We'll filter relevant changes in fetchSavedDeals
          () => {
            fetchSavedDeals();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(followsChannel);
        supabase.removeChannel(promosChannel);
      };
    } else {
      setIsLoading(false);
      setSavedDeals([]);
    }
  }, [user]);

  useEffect(() => {
    const filtered = savedDeals.filter(deal => 
      deal.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.promoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.influencerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDeals(filtered);
  }, [searchQuery, savedDeals]);

  const fetchSavedDeals = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setSavedDeals([]);
        return;
      }
      
      // Get all influencers that the user follows (distinct influencer_ids)
      const { data: followedInfluencerData, error: followError } = await supabase
        .from('user_domain_map')
        .select('influencer_id')
        .eq('user_id', user.id);
      
      if (followError) {
        console.error("Error fetching followed influencers:", followError);
        toast.error("Error loading your deals");
        setIsLoading(false);
        return;
      }
      
      if (!followedInfluencerData || followedInfluencerData.length === 0) {
        setSavedDeals([]);
        setIsLoading(false);
        return;
      }
      
      // Extract unique influencer IDs
      const influencerIds = [...new Set(followedInfluencerData.map(follow => follow.influencer_id))];
      
      // Get promo codes from followed influencers using the promo_codes table with profiles join
      // Filter out expired promo codes
      const now = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
      
      const { data: promoCodes, error: promoError } = await getPromoCodes()
        .in('influencer_id', influencerIds)
        .or(`expiration_date.gt.${now},expiration_date.is.null`)
        .order('created_at', { ascending: false });
      
      if (promoError) {
        console.error("Error fetching promo codes:", promoError);
        toast.error("Error loading promo codes");
        setIsLoading(false);
        return;
      }
      
      console.log(`Found ${promoCodes?.length || 0} promo codes from followed influencers`);
      
      // Transform the data
      const deals = (promoCodes || []).map(promo => ({
        id: promo.id || "",
        title: promo.description || "",
        brandName: promo.brand_name || "",
        discount: promo.promo_code || "",
        promoCode: promo.promo_code || "",
        expiryDate: promo.expiration_date,
        affiliateLink: promo.affiliate_link || "#",
        influencerName: promo.profiles?.full_name || 'Unknown Influencer',
        influencerImage: promo.profiles?.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        influencerUsername: promo.profiles?.username || 'unknown',
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
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-medium">Get notified when shopping online</h2>
            <p className="text-sm text-muted-foreground">Download our browser extension for automatic offer alerts.</p>
          </div>
          <Button size="sm" className="whitespace-nowrap" asChild>
            <a 
              href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Extension
            </a>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Alerts</h1>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search saved alerts..."
          className="w-full md:w-80"
        />
      </div>
      
      {isLoading ? (
        <div className="text-center py-16">
          <p>Loading your saved alerts...</p>
        </div>
      ) : filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDeals.map((deal) => (
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
              influencerUsername={deal.influencerUsername}
              category={deal.category}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">You haven't saved any alerts yet</h3>
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

export default MyAlerts;
