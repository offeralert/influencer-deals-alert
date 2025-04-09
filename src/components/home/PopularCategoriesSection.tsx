
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/ui/category-card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/components/CategoryFilter";

const PopularCategoriesSection = () => {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      const counts: Record<string, number> = {};
      
      for (const category of [...CATEGORIES, "Beauty"]) {
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
    }
  };

  return (
    <section className="py-12 bg-brand-light dark:bg-brand-dark">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Popular Categories</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/categories" className="flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...CATEGORIES, "Beauty"].slice(0, 5).map((category) => (
            <CategoryCard
              key={category}
              name={category}
              href={`/explore?category=${category}`}
              count={categoryCounts[category] || 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategoriesSection;
