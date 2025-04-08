
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import InfluencerCard from "@/components/ui/influencer-card";
import { DealCard } from "@/components/ui/deal-card";

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
  affiliateLink: string; // Make sure this is required here
  influencerName: string;
  influencerImage: string;
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch();
    } else {
      setInfluencers([]);
      setDeals([]);
      setBrands([]);
    }
  }, [searchQuery, activeTab]);

  const performSearch = async () => {
    setIsSearching(true);
    
    try {
      if (activeTab === "all" || activeTab === "influencers") {
        await searchInfluencers();
      }
      
      if (activeTab === "all" || activeTab === "brands") {
        await searchDeals();
      }
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const searchInfluencers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_influencer', true)
      .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
      .order('full_name');
    
    if (error) {
      console.error("Error searching influencers:", error);
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
  };
  
  const searchDeals = async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select(`
        id,
        brand_name,
        promo_code,
        description,
        expiration_date,
        affiliate_link,
        profiles:user_id (
          full_name,
          username,
          avatar_url
        )
      `)
      .or(`brand_name.ilike.%${searchQuery}%,promo_code.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .order('brand_name');
    
    if (error) {
      console.error("Error searching deals:", error);
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
      affiliateLink: deal.affiliate_link || "#", // Provide default value
      influencerName: deal.profiles?.full_name || 'Unknown Influencer',
      influencerImage: deal.profiles?.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
    }));
    
    setDeals(formattedDeals);
    
    // Extract unique brand names
    const uniqueBrands = [...new Set(data.map(deal => deal.brand_name))];
    setBrands(uniqueBrands);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search influencers, brands, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-brand-green focus:ring-brand-green"
        />
        <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute right-2 top-1.5"
          onClick={() => setSearchQuery("")}
        >
          Clear
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="influencers">Influencers</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {isSearching ? (
            <div className="text-center py-8">Searching...</div>
          ) : searchQuery.length < 3 ? (
            <div className="text-center py-16 text-gray-500">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Enter at least 3 characters to search</p>
            </div>
          ) : influencers.length === 0 && deals.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-8">
              {influencers.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Influencers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {influencers.slice(0, 4).map((influencer) => (
                      <InfluencerCard
                        key={influencer.id}
                        id={influencer.id}
                        name={influencer.full_name}
                        username={influencer.username}
                        imageUrl={influencer.avatar_url}
                        category={"Lifestyle"}
                        followers={influencer.followers_count || 0}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {deals.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Deals</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {deals.slice(0, 4).map((deal) => (
                      <DealCard key={deal.id} {...deal} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="influencers">
          {isSearching ? (
            <div className="text-center py-8">Searching...</div>
          ) : searchQuery.length < 3 ? (
            <div className="text-center py-16 text-gray-500">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Enter at least 3 characters to search for influencers</p>
            </div>
          ) : influencers.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No influencers found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {influencers.map((influencer) => (
                <InfluencerCard
                  key={influencer.id}
                  id={influencer.id}
                  name={influencer.full_name}
                  username={influencer.username}
                  imageUrl={influencer.avatar_url}
                  category={"Lifestyle"}
                  followers={influencer.followers_count || 0}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="brands">
          {isSearching ? (
            <div className="text-center py-8">Searching...</div>
          ) : searchQuery.length < 3 ? (
            <div className="text-center py-16 text-gray-500">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Enter at least 3 characters to search for brands</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No brands or deals found for "{searchQuery}"</p>
            </div>
          ) : (
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Brands</h2>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand, index) => (
                    <div key={index} className="bg-brand-light dark:bg-brand-dark px-3 py-1 rounded-full">
                      {brand}
                    </div>
                  ))}
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-4">Deals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {deals.map((deal) => (
                  <DealCard key={deal.id} {...deal} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Search;
