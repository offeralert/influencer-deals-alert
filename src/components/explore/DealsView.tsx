
import { Deal } from "@/types/explore";
import { DealCard } from "@/components/ui/deal-card";
import { Compass, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { isExpired } from "@/utils/dateUtils";

interface DealsViewProps {
  deals: Deal[];
  sortOption: string;
  selectedCategories: string[];
}

const DealsView = ({ deals, sortOption, selectedCategories }: DealsViewProps) => {
  const [showExpired, setShowExpired] = useState(false);
  
  // Filter deals based on expiration
  const filteredDeals = deals.filter(deal => 
    showExpired || !deal.expiryDate || !isExpired(deal.expiryDate)
  );

  if (filteredDeals.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-expired" 
              checked={showExpired} 
              onCheckedChange={setShowExpired} 
            />
            <Label htmlFor="show-expired" className="text-sm flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
              Show expired deals
            </Label>
          </div>
        </div>

        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No deals found</h3>
          <p className="text-gray-500">
            {selectedCategories.length > 0 
              ? "Try adjusting your category filters or toggle 'Show expired deals'"
              : showExpired 
                ? "No deals are available at this time" 
                : "Check back later for exciting promotions and discounts, or toggle 'Show expired deals'"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-expired" 
            checked={showExpired} 
            onCheckedChange={setShowExpired} 
          />
          <Label htmlFor="show-expired" className="text-sm flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
            Show expired deals
          </Label>
        </div>
      </div>

      {sortOption === "category" ? (
        <div className="mb-8">
          {Array.from(new Set(filteredDeals.map(deal => deal.category))).map(category => (
            <div key={category} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDeals
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
          {filteredDeals.map((deal) => (
            <DealCard 
              key={deal.id} 
              {...deal} 
              influencerId={deal.influencerId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DealsView;
