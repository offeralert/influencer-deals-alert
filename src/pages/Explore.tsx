import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Compass, Filter, Search } from "lucide-react";
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
import { getUniversalPromoCodes, UniversalPromoCode } from "@/utils/supabaseQueries";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type SortOption = "newest" | "alphabetical" | "discount" | "category";
type ExploreTab = "deals" | "influencers" | "brands";

interface Influencer {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  category?: string;
}

interface Deal {
  id: string;
  title: string;
  brandName: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
  influencerId: string;
  category: string;
}

interface Brand {
  name: string;
  dealCount: number;
}

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as ExploreTab || "deals";
  const initialCategory = searchParams.get("category") || "";
  
  const [activeTab, setActiveTab] = useState<ExploreTab>(initialTab);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      if (activeTab === "influencers") {
        await fetchInfluencers();
      } else if (activeTab === "deals") {
        await fetchDeals();
      } else if (activeTab === "brands") {
        await fetchBrands();
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
      let query = getUniversalPromoCodes();
      
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
      
      console.log(`Found ${data.length} deals matching search query`);
      
      const formattedDeals = data.map((deal: UniversalPromoCode) => ({
        id: deal.id || "",
        title: deal.description || "",
        brandName: deal.brand_name || "",
        discount: deal.promo_code || "",
        promoCode: deal.promo_code || "",
        expiryDate: deal.expiration_date,
        affiliateLink: deal.affiliate_link || "#",
        influencerName: deal.influencer_name || 'Unknown Influencer',
        influencerImage: deal.influencer_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        influencerId: deal.influencer_id || "",
        category: deal.category || 'Fashion'
      }));
      
      setDeals(formattedDeals);
    } catch (error) {
      console.error("Error in fetchDeals:", error);
      setDeals([]);
    }
  };

  const fetchBrands = async () => {
    try {
      let query = getUniversalPromoCodes();
      
      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching brands:", error);
        setBrands([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log("No brands found");
        setBrands([]);
        return;
      }
      
      const brandMap = new Map<string, number>();
      
      data.forEach((deal: UniversalPromoCode) => {
        if (deal.brand_name) {
          const currentCount = brandMap.get(deal.brand_name) || 0;
          brandMap.set(deal.brand_name, currentCount + 1);
        }
      });
      
      let brandsArray: Brand[] = Array.from(brandMap).map(([name, count]) => ({
        name,
        dealCount: count
      }));
      
      if (sortOption === 'alphabetical') {
        brandsArray.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortOption === 'discount') {
        brandsArray.sort((a, b) => b.dealCount - a.dealCount);
      } else {
        brandsArray.sort((a, b) => b.dealCount - a.dealCount);
      }
      
      setBrands(brandsArray);
    } catch (error) {
      console.error("Error in fetchBrands:", error);
      setBrands([]);
    }
  };

  const filteredBrands = brandSearch 
    ? brands.filter(brand => 
        brand.name.toLowerCase().includes(brandSearch.toLowerCase())
      )
    : brands;

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", activeTab);
    setSearchParams(newParams);
  }, [activeTab]);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategories.length === 1) {
      newParams.set("category", selectedCategories[0]);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams);
  }, [selectedCategories]);

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
            <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="influencers">Influencers</TabsTrigger>
              <TabsTrigger value="brands">Brands</TabsTrigger>
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
                    {activeTab === "influencers" ? "Name (A-Z)" : 
                     activeTab === "brands" ? "Brand (A-Z)" : "Brand (A-Z)"}
                  </SelectItem>
                  {activeTab === "deals" && (
                    <>
                      <SelectItem value="discount">Discount (High-Low)</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </>
                  )}
                  {activeTab === "brands" && (
                    <SelectItem value="discount">Deal Count (High-Low)</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {(activeTab === "deals" || activeTab === "brands") && (
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

      {activeTab === "brands" && (
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Search brands..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <p>Loading...</p>
        </div>
      ) : (
        <Tabs value={activeTab}>
          <TabsContent value="deals" className="mt-0">
            {deals.length > 0 ? (
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
                              <DealCard 
                                key={deal.id} 
                                {...deal} 
                                influencerId={deal.influencerId}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {deals.map((deal) => (
                      <DealCard 
                        key={deal.id} 
                        {...deal} 
                        influencerId={deal.influencerId}
                      />
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
            )}
          </TabsContent>
          
          <TabsContent value="influencers" className="mt-0">
            {influencers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {influencers.map((influencer) => (
                  <InfluencerCard
                    key={influencer.id}
                    id={influencer.id}
                    name={influencer.full_name}
                    username={influencer.username}
                    imageUrl={influencer.avatar_url}
                    category={influencer.category || "Lifestyle"}
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
            )}
          </TabsContent>
          
          <TabsContent value="brands" className="mt-0">
            {filteredBrands.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBrands.map((brand) => (
                  <Card key={brand.name} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{brand.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {brand.dealCount} {brand.dealCount === 1 ? 'offer' : 'offers'} available
                      </p>
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <a href={`/explore?tab=deals&brand=${encodeURIComponent(brand.name)}`}>
                          View Offers
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No brands found</h3>
                <p className="text-gray-500">
                  {brandSearch 
                    ? "Try a different search term" 
                    : selectedCategories.length > 0 
                      ? "Try adjusting your category filters"
                      : "Check back later for exciting brands and offers!"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Explore;
