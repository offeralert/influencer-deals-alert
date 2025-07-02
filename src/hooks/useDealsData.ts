
import { useState, useEffect } from "react";
import { getPromoCodes, PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { Deal, SortOption } from "@/types/explore";
import { getAvatarUrl } from "@/utils/avatarUtils";

export const useDealsData = (
  sortOption: SortOption,
  selectedCategories: string[],
  searchQuery: string = "",
  refreshKey: number = 0
) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      console.log(`[DEALS] Fetching deals...`);
      
      try {
        let query = getPromoCodes();
        
        if (selectedCategories.length > 0) {
          query = query.in('category', selectedCategories);
        }
        
        if (sortOption === 'alphabetical') {
          query = query.order('brand_name', { ascending: true });
        } else if (sortOption === 'discount') {
          query = query.order('promo_code', { ascending: false });
        } else if (sortOption === 'category') {
          query = query.order('category', { ascending: true });
        } else {
          query = query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("[DEALS] Error fetching deals:", error);
          setDeals([]);
          return;
        }
        
        if (!data || !Array.isArray(data)) {
          console.error("[DEALS] Expected array but received:", data);
          setDeals([]);
          return;
        }
        
        console.log(`[DEALS] Raw promo codes fetched: ${data.length}`);
        
        const validData = data.filter((deal: PromoCodeWithInfluencer) => {
          return deal.id && deal.brand_name && deal.promo_code && deal.profiles;
        });
        
        const formattedDeals = validData.map((deal: PromoCodeWithInfluencer) => ({
          id: deal.id || "",
          title: deal.description || "",
          brandName: deal.brand_name || "",
          discount: deal.promo_code || "",
          promoCode: deal.promo_code || "",
          expiryDate: deal.expiration_date,
          affiliateLink: deal.affiliate_link || "#",
          influencerName: deal.profiles?.full_name || 'Unknown Influencer',
          influencerImage: getAvatarUrl(deal.profiles?.avatar_url) || "",
          influencerUsername: deal.profiles?.username || 'unknown',
          category: deal.category || 'Fashion'
        }));
        
        const filtered = searchQuery
          ? formattedDeals.filter(deal => 
              deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              deal.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              deal.promoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
              deal.influencerName.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : formattedDeals;
        
        console.log(`[DEALS] Final deals count: ${filtered.length}`);
        setDeals(filtered);
      } catch (error) {
        console.error("[DEALS] Error in fetchDeals:", error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeals();
  }, [sortOption, selectedCategories, searchQuery, refreshKey]);

  return { deals, loading };
};
