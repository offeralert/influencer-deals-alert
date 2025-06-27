
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useExploreData } from "@/hooks/useExploreData";
import InfluencersView from "@/components/explore/InfluencersView";
import DealsView from "@/components/explore/DealsView";
import BrandsView from "@/components/explore/BrandsView";
import CreditCardsView from "@/components/explore/CreditCardsView";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/ui/search-bar";
import { ExploreTab, SortOption } from "@/types/explore";

const Explore = () => {
  const [activeTab, setActiveTab] = useState<ExploreTab>("deals");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { influencers, deals, brands, creditCards, loading } = useExploreData(
    activeTab,
    sortOption,
    selectedCategories,
    searchQuery
  );

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  const removeCategory = (categoryToRemove: string) => {
    setSelectedCategories(prev => prev.filter(cat => cat !== categoryToRemove));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const getSortOptions = () => {
    const baseOptions: { value: SortOption; label: string }[] = [
      { value: "newest", label: "Newest" },
      { value: "alphabetical", label: "A-Z" }
    ];

    if (activeTab === "deals") {
      baseOptions.push({ value: "category", label: "Category" });
    } else if (activeTab === "brands") {
      baseOptions.push({ value: "discount", label: "Most Deals" });
    }

    return baseOptions;
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-gray-600">Discover influencers, deals, and brands</p>
      </div>

      <div className="space-y-4">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
        />

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <CategoryFilter 
            selectedCategories={selectedCategories}
            onChange={handleCategoryChange}
            disabled={activeTab === "influencers" || activeTab === "creditcards"}
          />
          
          <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {getSortOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium">Filters:</span>
            {selectedCategories.map((category) => (
              <Badge 
                key={category} 
                variant="secondary" 
                className="flex items-center gap-1 px-3 py-1"
              >
                {category}
                <button 
                  onClick={() => removeCategory(category)}
                  className="ml-1 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${category} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <button 
              onClick={clearAllCategories}
              className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ExploreTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="influencers">Influencers</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="creditcards">Credit Cards</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="deals" className="space-y-6">
            <DealsView deals={deals} sortOption={sortOption} selectedCategories={selectedCategories} />
          </TabsContent>

          <TabsContent value="influencers" className="space-y-6">
            <InfluencersView influencers={influencers} />
          </TabsContent>

          <TabsContent value="brands" className="space-y-6">
            <BrandsView brands={brands} selectedCategories={selectedCategories} />
          </TabsContent>

          <TabsContent value="creditcards" className="space-y-6">
            <CreditCardsView creditCards={creditCards} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Explore;
