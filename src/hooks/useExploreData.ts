
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPromoCodes, PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { Influencer, Deal, Brand, ExploreTab, SortOption } from "@/types/explore";
import { getAvatarUrl } from "@/utils/avatarUtils";

export const useExploreData = (
  activeTab: ExploreTab,
  sortOption: SortOption,
  selectedCategories: string[],
  searchQuery: string = ""
) => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [creditCards, setCreditCards] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  // Add cache busting timestamp
  const getCacheBustingTimestamp = () => Math.floor(Date.now() / (1000 * 60 * 2)); // 2-minute cache

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log(`[EXPLORE] Fetching data for tab: ${activeTab}, timestamp: ${getCacheBustingTimestamp()}`);
      
      if (activeTab === "influencers") {
        await fetchInfluencers();
      } else if (activeTab === "deals") {
        await fetchDeals();
      } else if (activeTab === "brands") {
        await fetchBrands();
      } else if (activeTab === "creditcards") {
        await fetchCreditCards();
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [activeTab, sortOption, selectedCategories, searchQuery, getCacheBustingTimestamp()]);

  const fetchInfluencers = async () => {
    try {
      console.log('[EXPLORE] Starting fetchInfluencers...');
      
      // First get all unique influencer IDs from promo codes
      const { data: promoCodeData, error: promoError } = await supabase
        .from('promo_codes')
        .select('influencer_id');

      if (promoError) {
        console.error("[EXPLORE] Error fetching promo code influencers:", promoError);
        setInfluencers([]);
        return;
      }

      console.log(`[EXPLORE] Found ${promoCodeData?.length || 0} promo codes`);
      
      // Extract unique influencer IDs
      const influencerIds = [...new Set(promoCodeData?.map(p => p.influencer_id) || [])];
      console.log(`[EXPLORE] Unique influencer IDs: ${influencerIds.length}`);

      if (influencerIds.length === 0) {
        console.log('[EXPLORE] No influencer IDs found, setting empty array');
        setInfluencers([]);
        return;
      }

      // Now fetch only those influencers who have promo codes
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_influencer', true)
        .eq('is_creditcard', false)
        .in('id', influencerIds)
        .order(sortOption === 'alphabetical' ? 'full_name' : 'created_at', 
               { ascending: sortOption === 'alphabetical' });
      
      if (error) {
        console.error("[EXPLORE] Error fetching influencers:", error);
        setInfluencers([]);
        return;
      }
      
      console.log(`[EXPLORE] Fetched ${data?.length || 0} influencer profiles`);
      
      const formattedInfluencers = data?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unnamed Influencer',
        username: profile.username || 'unknown',
        avatar_url: profile.avatar_url,
        is_creditcard: profile.is_creditcard
      })) || [];
      
      // Filter by search query if provided
      const filtered = searchQuery
        ? formattedInfluencers.filter(inf => 
            inf.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inf.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : formattedInfluencers;
      
      console.log(`[EXPLORE] Final influencers count after filtering: ${filtered.length}`);
      setInfluencers(filtered);
    } catch (error) {
      console.error("[EXPLORE] Error in fetchInfluencers:", error);
      setInfluencers([]);
    }
  };

  const fetchCreditCards = async () => {
    try {
      console.log('[EXPLORE] Starting fetchCreditCards...');
      
      // First get all unique influencer IDs from promo codes
      const { data: promoCodeData, error: promoError } = await supabase
        .from('promo_codes')
        .select('influencer_id');

      if (promoError) {
        console.error("[EXPLORE] Error fetching promo code credit cards:", promoError);
        setCreditCards([]);
        return;
      }

      console.log(`[EXPLORE] Found ${promoCodeData?.length || 0} promo codes for credit cards`);

      // Extract unique influencer IDs
      const creditCardIds = [...new Set(promoCodeData?.map(p => p.influencer_id) || [])];
      console.log(`[EXPLORE] Unique credit card IDs: ${creditCardIds.length}`);

      if (creditCardIds.length === 0) {
        console.log('[EXPLORE] No credit card IDs found, setting empty array');
        setCreditCards([]);
        return;
      }

      // Now fetch only those credit cards who have promo codes
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_creditcard', true)
        .in('id', creditCardIds)
        .order(sortOption === 'alphabetical' ? 'full_name' : 'created_at', 
               { ascending: sortOption === 'alphabetical' });
      
      if (error) {
        console.error("[EXPLORE] Error fetching credit cards:", error);
        setCreditCards([]);
        return;
      }
      
      console.log(`[EXPLORE] Fetched ${data?.length || 0} credit card profiles`);
      
      const formattedCreditCards = data?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unnamed Credit Card',
        username: profile.username || 'creditcard',
        avatar_url: profile.avatar_url,
        is_creditcard: profile.is_creditcard
      })) || [];
      
      // Filter by search query if provided
      const filtered = searchQuery
        ? formattedCreditCards.filter(card => 
            card.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : formattedCreditCards;
      
      console.log(`[EXPLORE] Final credit cards count after filtering: ${filtered.length}`);
      setCreditCards(filtered);
    } catch (error) {
      console.error("[EXPLORE] Error in fetchCreditCards:", error);
      setCreditCards([]);
    }
  };

  const fetchDeals = async () => {
    try {
      console.log('[EXPLORE] Starting fetchDeals...');
      console.log(`[EXPLORE] Selected categories: ${selectedCategories.length > 0 ? selectedCategories.join(', ') : 'none'}`);
      console.log(`[EXPLORE] Search query: "${searchQuery}"`);
      console.log(`[EXPLORE] Sort option: ${sortOption}`);
      
      let query = getPromoCodes();
      
      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
        console.log('[EXPLORE] Applied category filter');
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
        console.error("[EXPLORE] Error fetching deals:", error);
        setDeals([]);
        return;
      }
      
      if (!data || !Array.isArray(data)) {
        console.error("[EXPLORE] Expected array but received:", data);
        setDeals([]);
        return;
      }
      
      console.log(`[EXPLORE] Raw promo codes fetched: ${data.length}`);
      console.log(`[EXPLORE] Sample raw data:`, data.slice(0, 2));
      
      // Validate data and filter out invalid entries
      const validData = data.filter((deal: PromoCodeWithInfluencer) => {
        const isValid = deal.id && deal.brand_name && deal.promo_code && deal.profiles;
        if (!isValid) {
          console.warn('[EXPLORE] Invalid deal found:', {
            id: deal.id,
            brand_name: deal.brand_name,
            promo_code: deal.promo_code,
            has_profile: !!deal.profiles
          });
        }
        return isValid;
      });
      
      console.log(`[EXPLORE] Valid promo codes after validation: ${validData.length}`);
      
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
      
      console.log(`[EXPLORE] Formatted deals: ${formattedDeals.length}`);
      console.log(`[EXPLORE] Sample formatted deals:`, formattedDeals.slice(0, 2));
      
      // Filter deals by search query if provided
      const filtered = searchQuery
        ? formattedDeals.filter(deal => 
            deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            deal.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            deal.promoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            deal.influencerName.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : formattedDeals;
      
      console.log(`[EXPLORE] Final deals count after search filtering: ${filtered.length}`);
      
      // Log specific influencer data for debugging
      const rachealDeals = filtered.filter(deal => 
        deal.influencerUsername.toLowerCase().includes('rachael') ||
        deal.influencerName.toLowerCase().includes('rachael')
      );
      
      if (rachealDeals.length > 0) {
        console.log(`[EXPLORE] Found ${rachealDeals.length} deals for Rachael:`, rachealDeals);
      } else {
        console.log('[EXPLORE] No deals found for Rachael');
      }
      
      setDeals(filtered);
    } catch (error) {
      console.error("[EXPLORE] Error in fetchDeals:", error);
      setDeals([]);
    }
  };

  const fetchBrands = async () => {
    try {
      console.log('[EXPLORE] Starting fetchBrands...');
      
      let query = getPromoCodes();
      
      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("[EXPLORE] Error fetching brands:", error);
        setBrands([]);
        return;
      }
      
      if (!data || !Array.isArray(data)) {
        console.error("[EXPLORE] Expected array but received:", data);
        setBrands([]);
        return;
      }
      
      console.log(`[EXPLORE] Fetched ${data.length} promo codes for brands`);
      
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
      
      console.log(`[EXPLORE] Unique brands found: ${brandsArray.length}`);
      
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
      
      console.log(`[EXPLORE] Final brands count after filtering and sorting: ${brandsArray.length}`);
      setBrands(brandsArray);
    } catch (error) {
      console.error("[EXPLORE] Error in fetchBrands:", error);
      setBrands([]);
    }
  };

  return { influencers, deals, brands, creditCards, loading };
};
