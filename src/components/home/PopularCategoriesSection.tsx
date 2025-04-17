
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/ui/category-card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/components/CategoryFilter";
import { getUniversalPromoCodes } from "@/utils/supabaseQueries";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const PopularCategoriesSection = () => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      setLoading(true);
      const counts: Record<string, number> = {};
      
      const { data, error } = await getUniversalPromoCodes();
      
      if (error) {
        console.error("Error fetching promo codes:", error);
        return;
      }
      
      if (data) {
        const allCategories = [...CATEGORIES, "Beauty"];
        
        allCategories.forEach(cat => {
          counts[cat] = 0;
        });
        
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

  const getTopCategories = (count: number) => {
    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([category]) => category);
  };

  return (
    <section className="py-8 md:py-12 bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold">Popular Categories</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/categories" className="flex items-center text-sm">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className={cn(
          "grid gap-3 md:gap-4",
          isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        )}>
          {loading ? (
            [...Array(isMobile ? 4 : 5)].map((_, index) => (
              <div key={index} className="p-3 md:p-4 rounded-lg border border-border bg-card animate-pulse">
                <div className="h-5 md:h-6 w-2/3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 md:h-4 w-1/3 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            [...CATEGORIES, "Beauty"]
              .slice(0, isMobile ? 4 : 5)
              .map((category) => (
                <CategoryCard
                  key={category}
                  name={category}
                  href={`/explore?category=${category}`}
                  count={categoryCounts[category] || 0}
                  className="p-3 md:p-4"
                />
              ))
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularCategoriesSection;
