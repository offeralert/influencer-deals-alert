
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/components/CategoryFilter";
import CategoryCard from "@/components/ui/category-card";

// Add "Beauty" to the categories
const updatedCategories = [...CATEGORIES, "Beauty"];

const Categories = () => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      setLoading(true);
      
      // Get counts for each category from the promo_codes table
      const counts: Record<string, number> = {};
      
      for (const category of updatedCategories) {
        const { count, error } = await supabase
          .from('promo_codes')
          .select('id', { count: 'exact', head: true })
          .eq('category', category);
        
        if (error) {
          console.error(`Error fetching count for category ${category}:`, error);
          counts[category] = 0;
        } else {
          counts[category] = count || 0;
        }
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error("Error in fetchCategoryCounts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Browse Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {updatedCategories.map((category) => (
                <CategoryCard
                  key={category}
                  name={category}
                  image={`https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80`}
                  href={`/explore?category=${category}`}
                  count={categoryCounts[category] || 0}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Categories;
