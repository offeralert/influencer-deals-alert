
import { useState, useEffect } from "react";
import { getPromoCodes, PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { Brand, SortOption } from "@/types/explore";

export const useBrandsData = (
  sortOption: SortOption,
  selectedCategories: string[],
  searchQuery: string = ""
) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      console.log('[BRANDS] Starting fetchBrands...');
      
      try {
        let query = getPromoCodes();
        
        if (selectedCategories.length > 0) {
          query = query.in('category', selectedCategories);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("[BRANDS] Error fetching brands:", error);
          setBrands([]);
          return;
        }
        
        if (!data || !Array.isArray(data)) {
          console.error("[BRANDS] Expected array but received:", data);
          setBrands([]);
          return;
        }
        
        console.log(`[BRANDS] Fetched ${data.length} promo codes for brands`);
        
        const brandMap = new Map<string, number>();
        
        data.forEach((deal: PromoCodeWithInfluencer) => {
          if (deal.brand_name) {
            const currentCount = brandMap.get(deal.brand_name) || 0;
            brandMap.set(deal.brand_name, currentCount + 1);
          }
        });
        
        let brandsArray: Brand[] = Array.from(brandMap).map(([name, count]) => ({
          name,
          dealCount: count
        }));
        
        console.log(`[BRANDS] Unique brands found: ${brandsArray.length}`);
        
        // Filter brands by search query if provided
        if (searchQuery) {
          brandsArray = brandsArray.filter(brand => 
            brand.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        if (sortOption === 'alphabetical') {
          brandsArray.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'discount') {
          brandsArray.sort((a, b) => b.dealCount - a.dealCount);
        } else {
          brandsArray.sort((a, b) => b.dealCount - a.dealCount);
        }
        
        console.log(`[BRANDS] Final brands count after filtering and sorting: ${brandsArray.length}`);
        setBrands(brandsArray);
      } catch (error) {
        console.error("[BRANDS] Error in fetchBrands:", error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrands();
  }, [sortOption, selectedCategories, searchQuery]);

  return { brands, loading };
};
