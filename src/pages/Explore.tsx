
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Compass } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import InfluencerCard from "@/components/ui/influencer-card";
import { DealCard } from "@/components/ui/deal-card";

type SortOption = "newest" | "alphabetical" | "discount";
type ExploreTab = "deals" | "influencers";

interface Influencer {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  followers_count?: number;
  category?: string;
}

interface Deal {
  id: string;
  title: string;
  brandName: string;
  imageUrl: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink?: string;
  influencerName: string;
  influencerImage: string;
}

const Explore = () => {
  const [activeTab, setActiveTab] = useState<ExploreTab>("deals");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      if (activeTab === "influencers") {
        await fetchInfluencers();
      } else {
        await fetchDeals();
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [activeTab, sortOption]);
  
  const fetchInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_influencer', true)
        .order(sortOption === 'alphabetical' ? 'full_name' : 'created_at', 
               { ascending: sortOption === 'alphabetical' });
      
      if (error) {
        console.error("Error fetching influencers:", error);
        return;
      }
      
      // Transform data to match the Influencer interface
      const formattedInfluencers = data.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unnamed Influencer',
        username: profile.username || 'unknown',
        avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        followers_count: Math.floor(Math.random() * 100000), // Placeholder
        category: 'Lifestyle' // Placeholder
      }));
      
      setInfluencers(formattedInfluencers);
    } catch (error) {
      console.error("Error in fetchInfluencers:", error);
    }
  };
  
  const fetchDeals = async () => {
    try {
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
          profiles:user_id (
            full_name,
            username,
            avatar_url
          )
        `)
        .order(
          sortOption === 'alphabetical' ? 'brand_name' : 
          sortOption === 'discount' ? 'promo_code' : 'created_at',
          { ascending: sortOption === 'alphabetical' }
        );
      
      if (error) {
        console.error("Error fetching deals:", error);
        return;
      }
      
      // Transform data to match the Deal interface
      const formattedDeals = data.map(deal => ({
        id: deal.id,
        title: deal.description,
        brandName: deal.brand_name,
        imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9", // Placeholder
        discount: deal.promo_code,
        promoCode: deal.promo_code,
        expiryDate: deal.expiration_date,
        affiliateLink: deal.affiliate_link,
        influencerName: deal.profiles?.full_name || 'Unknown Influencer',
        influencerImage: deal.profiles?.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
      }));
      
      setDeals(formattedDeals);
    } catch (error) {
      console.error("Error in fetchDeals:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Explore</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as ExploreTab)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-2 w-full sm:w-[200px]">
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select 
            value={sortOption} 
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="newest">Newly Added</SelectItem>
                <SelectItem value="alphabetical">
                  {activeTab === "influencers" ? "Name (A-Z)" : "Brand (A-Z)"}
                </SelectItem>
                {activeTab === "deals" && (
                  <SelectItem value="discount">Discount (High-Low)</SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p>Loading...</p>
        </div>
      ) : (
        <TabsContent value={activeTab} className="mt-0">
          {activeTab === "influencers" ? (
            influencers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {influencers.map((influencer) => (
                  <InfluencerCard
                    key={influencer.id}
                    id={influencer.id}
                    name={influencer.full_name}
                    username={influencer.username}
                    imageUrl={influencer.avatar_url}
                    category={influencer.category || "Lifestyle"}
                    followers={influencer.followers_count || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No influencers found</h3>
                <p className="text-gray-500">
                  Check back later for exciting influencers to follow!
                </p>
              </div>
            )
          ) : (
            deals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {deals.map((deal) => (
                  <DealCard key={deal.id} {...deal} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No deals found</h3>
                <p className="text-gray-500">
                  Check back later for exciting promotions and discounts!
                </p>
              </div>
            )
          )}
        </TabsContent>
      )}
    </div>
  );
};

export default Explore;
