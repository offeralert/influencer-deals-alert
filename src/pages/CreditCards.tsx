
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SortOption } from "@/types/explore";
import { useCreditCardsData } from "@/hooks/useCreditCardsData";
import CreditCardsView from "@/components/explore/CreditCardsView";
import SearchBar from "@/components/ui/search-bar";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const CreditCards = () => {
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  
  useScrollToTop();

  const { creditCards, loading } = useCreditCardsData(
    sortOption,
    searchQuery
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Credit Cards</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search credit cards..."
            className="w-full md:w-80"
          />
          
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
                <SelectItem value="alphabetical">Name (A-Z)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p>Loading credit cards...</p>
        </div>
      ) : (
        <CreditCardsView creditCards={creditCards} />
      )}
    </div>
  );
};

export default CreditCards;
