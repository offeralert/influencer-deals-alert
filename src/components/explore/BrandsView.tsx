
import { Brand } from "@/types/explore";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

interface BrandsViewProps {
  brands: Brand[];
  selectedCategories: string[];
}

const BrandsView = ({ brands, selectedCategories }: BrandsViewProps) => {
  return (
    <div>
      {brands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brands.map((brand) => (
            <Link 
              key={brand.name} 
              to={`/brand/${encodeURIComponent(brand.name)}`}
              className="block hover:shadow-md transition-shadow"
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{brand.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {brand.dealCount} {brand.dealCount === 1 ? 'offer' : 'offers'} available
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Compass className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No brands found</h3>
          <p className="text-gray-500">
            {selectedCategories.length > 0 
              ? "Try adjusting your category filters"
              : "Check back later for exciting brands and offers!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandsView;
