
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
import { Filter } from "lucide-react";
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
import { ExploreTab, SortOption } from "@/types/explore";
import { useExploreData } from "@/hooks/useExploreData";
import DealsView from "@/components/explore/DealsView";
import InfluencersView from "@/components/explore/InfluencersView";
import BrandsView from "@/components/explore/BrandsView";
import SearchBar from "@/components/ui/search-bar";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as ExploreTab || "deals";
  const initialCategory = searchParams.get("category") || "";
  
  const [activeTab, setActiveTab] = useState<ExploreTab>(initialTab);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Use the hook to scroll to top on route changes
  useScrollToTop();

  const { deals, influencers, brands, loading } = useExploreData(
    activeTab,
    sortOption,
    selectedCategories,
    searchQuery
  );

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

  // Clear search when tab changes
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "deals":
        return "Search deals, promos, or brands...";
      case "influencers":
        return "Search influencers by name or username...";
      case "brands":
        return "Search brands...";
      default:
        return "Search...";
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
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={getSearchPlaceholder()}
            className="w-full md:w-80"
          />
          
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

      {loading ? (
        <div className="text-center py-16">
          <p>Loading...</p>
        </div>
      ) : (
        <Tabs value={activeTab}>
          <TabsContent value="deals" className="mt-0">
            <DealsView 
              deals={deals} 
              sortOption={sortOption} 
              selectedCategories={selectedCategories} 
            />
          </TabsContent>
          
          <TabsContent value="influencers" className="mt-0">
            <InfluencersView influencers={influencers} />
          </TabsContent>
          
          <TabsContent value="brands" className="mt-0">
            <BrandsView 
              brands={brands} 
              selectedCategories={selectedCategories} 
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Explore;
