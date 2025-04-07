
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search influencers, brands, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-brand-green focus:ring-brand-green"
        />
        <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute right-2 top-1.5"
          onClick={() => setSearchQuery("")}
        >
          Clear
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="influencers">Influencers</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="text-center py-16 text-gray-500">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Search for influencers, brands, or promo codes</p>
          </div>
        </TabsContent>
        
        <TabsContent value="influencers">
          <div className="text-center py-16 text-gray-500">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Search for your favorite influencers</p>
          </div>
        </TabsContent>
        
        <TabsContent value="brands">
          <div className="text-center py-16 text-gray-500">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Search for brands and their offers</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Search;
