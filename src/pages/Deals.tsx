
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
import { SortOption } from "@/types/explore";
import { useDealsData } from "@/hooks/useDealsData";
import DealsView from "@/components/explore/DealsView";
import SearchBar from "@/components/ui/search-bar";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const Deals = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useScrollToTop();

  const { deals, loading } = useDealsData(
    sortOption,
    selectedCategories,
    searchQuery,
    refreshKey
  );

  const handleRefresh = useCallback(() => {
    console.log('[DEALS] Manual refresh triggered');
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategories.length === 1) {
      newParams.set("category", selectedCategories[0]);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams);
  }, [selectedCategories]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[DEALS] Auto-refresh triggered');
      handleRefresh();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [handleRefresh]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setFiltersOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Deals & Promo Codes</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search deals, promos, or brands..."
            className="w-full md:w-80"
          />
          
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
                  <SelectItem value="alphabetical">Brand (A-Z)</SelectItem>
                  <SelectItem value="discount">Discount (High-Low)</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
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
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p>Loading deals...</p>
        </div>
      ) : (
        <DealsView 
          deals={deals} 
          sortOption={sortOption} 
          selectedCategories={selectedCategories}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default Deals;
