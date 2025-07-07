
import { useState } from "react";
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
import { useBrandsData } from "@/hooks/useBrandsData";
import BrandsView from "@/components/explore/BrandsView";
import SearchBar from "@/components/ui/search-bar";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const Brands = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  useScrollToTop();

  const { brands, loading } = useBrandsData(
    sortOption,
    searchQuery
  );


  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Brands</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search brands..."
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
                  <SelectItem value="discount">Deal Count (High-Low)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p>Loading brands...</p>
        </div>
      ) : (
        <BrandsView 
          brands={brands} 
        />
      )}
    </div>
  );
};

export default Brands;
