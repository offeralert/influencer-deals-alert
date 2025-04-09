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
import { Compass, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import InfluencerCard from "@/components/ui/influencer-card";
import { DealCard } from "@/components/ui/deal-card";
import { Button } from "@/components/ui/button";
import CategoryFilter from "@/components/CategoryFilter";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";

type SortOption = "newest" | "alphabetical" | "discount" | "category";
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
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
  category: string;
}

const Explore = () => {
  const [activeTab, setActiveTab] = useState<ExploreTab>("deals");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
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
  }, [activeTab, sortOption, selectedCategories]);
  
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
        setInfluencers([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No influencers found");
        setInfluencers([]);
        return;
      }
      
      const formattedInfluencers = data.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unnamed Influencer',
        username: profile.username || 'unknown',
        avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        followers_count: Math.floor(Math.random() * 100000),
        category: 'Lifestyle'
      }));
      
      setInfluencers(formattedInfluencers);
    } catch (error) {
      console.error("Error in fetchInfluencers:", error);
      setInfluencers([]);
    }
  };
  
  const fetchDeals = async () => {
    try {
      let query = supabase
        .from('universal_promo_codes')
        .select('*');
      
      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }
      
      if (sortOption === 'alphabetical') {
        query = query.order('brand_name', { ascending: true });
      } else if (sortOption === 'discount') {
        query = query.order('promo_code', { ascending: false });
      } else if (sortOption === 'category') {
        query = query.order('category', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching deals:", error);
        setDeals([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No deals found");
        setDeals([]);
        return;
      }
      
      console.log(`Found ${data.length} deals`);
      
      const formattedDeals = data.map(deal => ({
        id: deal.id,
        title: deal.description,
        brandName: deal.brand_name,
        imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
        discount: deal.promo_code,
        promoCode: deal.promo_code,
        expiryDate: deal.expiration_date,
        affiliateLink: deal.affiliate_link || "#",
        influencerName: deal.influencer_name || 'Unknown Influencer',
        influencerImage: deal.influencer_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        category: deal.category || 'Fashion'
      }));
      
      console.log(`Formatted ${formattedDeals.length} deals`);
      setDeals(formattedDeals);
    } catch (error) {
      console.error("Error in fetchDeals:", error);
      setDeals([]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setFiltersOpen(false);
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
          
          <div className="flex gap-2">
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
                    <>
                      <SelectItem value="discount">Discount (High-Low)</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {activeTab === "deals" && (
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="md:w-auto md:px-3 flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:inline">Filters</span>
                    {selectedCategories.length > 0 && (
                      <span className="bg-brand-green text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {selectedCategories.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <CategoryFilter 
                      selectedCategories={selectedCategories} 
                      onChange={setSelectedCategories} 
                    />
                  </div>
                  <SheetFooter>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                    <Button onClick={() => setFiltersOpen(false)}>
                      Apply Filters
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p>Loading...</p>
        </div>
      ) : (
        <Tabs value={activeTab}>
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
                <div>
                  {sortOption === "category" ? (
                    <div className="mb-8">
                      {Array.from(new Set(deals.map(deal => deal.category))).map(category => (
                        <div key={category} className="mb-6">
                          <h2 className="text-xl font-semibold mb-4">{category}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {deals
                              .filter(deal => deal.category === category)
                              .map(deal => (
                                <DealCard key={deal.id} {...deal} />
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {deals.map((deal) => (
                        <DealCard key={deal.id} {...deal} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No deals found</h3>
                  <p className="text-gray-500">
                    {selectedCategories.length > 0 
                      ? "Try adjusting your category filters"
                      : "Check back later for exciting promotions and discounts!"}
                  </p>
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Explore;
