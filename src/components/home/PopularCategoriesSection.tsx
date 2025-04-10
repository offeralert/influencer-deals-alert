
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/ui/category-card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/components/CategoryFilter";
import { getUniversalPromoCodes } from "@/utils/supabaseQueries";

const PopularCategoriesSection = () => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      setLoading(true);
      const counts: Record<string, number> = {};
      
      // Get all promo codes
      const { data, error } = await getUniversalPromoCodes();
      
      if (error) {
        console.error("Error fetching promo codes:", error);
        return;
      }
      
      // Count occurrences of each category
      if (data) {
        const allCategories = [...CATEGORIES, "Beauty"];
        
        // Initialize all categories with zero count
        allCategories.forEach(cat => {
          counts[cat] = 0;
        });
        
        // Count the actual occurrences in the data
        data.forEach(promo => {
          if (promo.category && counts[promo.category] !== undefined) {
            counts[promo.category]++;
          }
        });
      }
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error("Error in fetchCategoryCounts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Popular Categories</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/explore" className="flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {loading ? (
            // Simple loading state for categories
            [...Array(5)].map((_, index) => (
              <div key={index} className="p-4 rounded-lg border border-border bg-card animate-pulse">
                <div className="h-6 w-2/3 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            // Display categories with counts
            [...CATEGORIES, "Beauty"].slice(0, 5).map((category) => (
              <CategoryCard
                key={category}
                name={category}
                href={`/explore?category=${category}`}
                count={categoryCounts[category] || 0}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularCategoriesSection;
