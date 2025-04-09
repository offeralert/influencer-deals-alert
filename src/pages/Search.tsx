import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import InfluencerCard from "@/components/ui/influencer-card";
import { DealCard } from "@/components/ui/deal-card";
import CategoryFilter from "@/components/CategoryFilter";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";

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

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch();
    } else {
      setInfluencers([]);
      setDeals([]);
      setBrands([]);
    }
  }, [searchQuery, activeTab, selectedCategories]);

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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_influencer', true)
        .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .order('full_name');
      
      if (error) {
        console.error("Error searching influencers:", error);
        setInfluencers([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No influencers found matching the search query");
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
      console.error("Error in searchInfluencers:", error);
      setInfluencers([]);
    }
  };
  
  const searchDeals = async () => {
    try {
      const { data: influencerProfiles, error: influencerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_influencer', true);
      
      if (influencerError) {
        console.error("Error fetching influencer profiles:", influencerError);
        setDeals([]);
        setBrands([]);
        return;
      }
      
      const influencerIds = influencerProfiles.map(profile => profile.id);
      
      if (influencerIds.length === 0) {
        console.log("No influencers found");
        setDeals([]);
        setBrands([]);
        return;
      }
      
      let query = supabase
        .from('promo_codes')
        .select(`
          id,
          brand_name,
          promo_code,
          description,
          expiration_date,
          affiliate_link,
          category,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .in('user_id', influencerIds);
      
      const searchTerms = [
        `brand_name.ilike.%${searchQuery}%`, 
        `promo_code.ilike.%${searchQuery}%`, 
        `description.ilike.%${searchQuery}%`, 
        `category.ilike.%${searchQuery}%`
      ];
      
      query = query.or(searchTerms.join(','));

      // No more expiration date filtering - show all promo codes regardless of expiration
      
      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }
      
      const { data, error } = await query.order('brand_name');
      
      if (error) {
        console.error("Error searching deals:", error);
        setDeals([]);
        setBrands([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No deals found matching the search query");
        setDeals([]);
        setBrands([]);
        return;
      }
      
      console.log(`Found ${data.length} deals matching search query`);
      
      const validDeals = data.filter(deal => 
        deal.brand_name && 
        deal.promo_code && 
        deal.description
      );
      
      const formattedDeals = validDeals.map(deal => ({
        id: deal.id,
        title: deal.description,
        brandName: deal.brand_name,
        imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
        discount: deal.promo_code,
        promoCode: deal.promo_code,
        expiryDate: deal.expiration_date,
        affiliateLink: deal.affiliate_link || "#",
        influencerName: deal.profiles?.full_name || 'Unknown Influencer',
        influencerImage: deal.profiles?.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        category: deal.category || 'Fashion'
      }));
      
      setDeals(formattedDeals);
      
      const uniqueBrands = [...new Set(validDeals.map(deal => deal.brand_name))];
      setBrands(uniqueBrands);
    } catch (error) {
      console.error("Error in searchDeals:", error);
      setDeals([]);
      setBrands([]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setFiltersOpen(false);
  };

  const getCategoryCount = (category: string) => {
    return deals.filter(deal => deal.category === category).length;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search influencers, brands, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-brand-green focus:ring-brand-green"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-1.5"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
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
              {selectedCategories.length > 0 && (
                <p className="mt-2 text-sm">Try adjusting your category filters</p>
              )}
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
              {selectedCategories.length > 0 && (
                <p className="mt-2 text-sm">Try adjusting your category filters</p>
              )}
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
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(deals.map(deal => deal.category))).map((category) => (
                    <div key={category} className="bg-brand-light dark:bg-brand-dark px-3 py-1 rounded-full flex items-center gap-2">
                      <span>{category}</span>
                      <span className="bg-white dark:bg-gray-800 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getCategoryCount(category)}
                      </span>
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
