
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Compass } from "lucide-react";

type SortOption = "newest" | "alphabetical" | "discount";

const Explore = () => {
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  
  // Placeholder for deals data
  const deals = [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Explore Deals</h1>
        
        <Select 
          value={sortOption} 
          onValueChange={(value) => setSortOption(value as SortOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="newest">Newly Added</SelectItem>
              <SelectItem value="alphabetical">Brand (A-Z)</SelectItem>
              <SelectItem value="discount">Discount (High-Low)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {deals.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No deals found</h3>
          <p className="text-gray-500">
            Check back later for exciting promotions and discounts!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Deal cards would go here */}
        </div>
      )}
    </div>
  );
};

export default Explore;
