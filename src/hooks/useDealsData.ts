
import { useState, useEffect } from "react";
import { getPromoCodes, PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { Deal, SortOption } from "@/types/explore";
import { getAvatarUrl } from "@/utils/avatarUtils";

export const useDealsData = (
  sortOption: SortOption,
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
        
        // Apply sorting
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
        
        // Only filter out codes that are missing essential data
        const validData = data.filter((deal: PromoCodeWithInfluencer) => {
          const hasRequiredFields = deal.id && deal.brand_name && deal.promo_code;
          const hasValidProfile = deal.profiles && deal.profiles.username;
          
          if (!hasRequiredFields) {
            console.log(`[DEALS] Filtering out deal with missing required fields:`, deal.id);
            return false;
          }
          
          if (!hasValidProfile) {
            console.log(`[DEALS] Filtering out deal with invalid profile:`, deal.id);
            return false;
          }
          
          // Check if deal is expired
          if (deal.expiration_date) {
            const expiryDate = new Date(deal.expiration_date);
            const now = new Date();
            if (expiryDate < now) {
              console.log(`[DEALS] Filtering out expired deal:`, deal.id);
              return false;
            }
          }
          
          return true;
        });
        
        console.log(`[DEALS] Valid deals after filtering: ${validData.length}`);
        
        const formattedDeals = validData.map((deal: PromoCodeWithInfluencer) => ({
          id: deal.id || "",
          title: deal.description || "Special Offer",
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
        
        // Apply search filter only if search query exists
        const filtered = searchQuery.trim()
          ? formattedDeals.filter(deal => {
              const searchLower = searchQuery.toLowerCase();
              return (
                deal.title.toLowerCase().includes(searchLower) ||
                deal.brandName.toLowerCase().includes(searchLower) ||
                deal.promoCode.toLowerCase().includes(searchLower) ||
                deal.influencerName.toLowerCase().includes(searchLower) ||
                deal.category.toLowerCase().includes(searchLower)
              );
            })
          : formattedDeals;
        
        console.log(`[DEALS] Final deals count after search filter: ${filtered.length}`);
        setDeals(filtered);
      } catch (error) {
        console.error("[DEALS] Error in fetchDeals:", error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeals();
  }, [sortOption, searchQuery, refreshKey]);

  return { deals, loading };
};
