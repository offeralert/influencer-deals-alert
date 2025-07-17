import { useMemo } from "react";
import { Deal, SortOption } from "@/types/explore";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { useGlobalPromoCodes } from "./useGlobalPromoCodes";
import { isExpired, isExpiringSoon } from "@/utils/dateUtils";

export const useDealsData = (
  sortOption: SortOption,
  searchQuery: string = ""
) => {
  const { promoCodes, loading } = useGlobalPromoCodes();

  const deals: Deal[] = useMemo(() => {
    // Filter and transform promo codes
    const validDeals = promoCodes
      .filter((deal) => {
        const hasRequiredFields = deal.id && deal.brand_name && deal.promo_code;
        const hasValidProfile = deal.profiles && deal.profiles.username;
        
        // Optional search filter
        const matchesSearch = !searchQuery.trim() || 
          [
            deal.description,
            deal.brand_name, 
            deal.promo_code, 
            deal.profiles?.full_name || '',
            deal.category
          ].some(field => 
            field?.toLowerCase().includes(searchQuery.toLowerCase())
          );

        return hasRequiredFields && 
               hasValidProfile && 
               matchesSearch && 
               (!deal.expiration_date || !isExpired(deal.expiration_date));
      })
      .map((deal) => ({
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
        category: deal.category || 'Fashion',
        expired: deal.expiration_date ? isExpired(deal.expiration_date) : false,
        expiringSoon: deal.expiration_date ? isExpiringSoon(deal.expiration_date) : false
      }));

    // Sort deals based on option
    return validDeals.sort((a, b) => {
      switch (sortOption) {
        case 'alphabetical': 
          return a.brandName.localeCompare(b.brandName);
        case 'discount':
          return b.promoCode.localeCompare(a.promoCode);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return new Date(b.expiryDate || 0).getTime() - new Date(a.expiryDate || 0).getTime();
      }
    });
  }, [promoCodes, sortOption, searchQuery]);

  return { deals, loading };
};