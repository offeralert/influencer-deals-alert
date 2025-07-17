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
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  useScrollToTop();

  const { deals, loading } = useDealsData(
    sortOption,
    searchQuery
  );

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
        />
      )}
    </div>
  );
};

export default Deals;