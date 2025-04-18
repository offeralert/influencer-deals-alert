
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUniversalPromoCodes, UniversalPromoCode } from "@/utils/supabaseQueries";
import { Influencer, Deal, Brand, ExploreTab, SortOption } from "@/types/explore";

export const useExploreData = (
  activeTab: ExploreTab,
  sortOption: SortOption,
  selectedCategories: string[]
) => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      if (activeTab === "influencers") {
        await fetchInfluencers();
      } else if (activeTab === "deals") {
        await fetchDeals();
      } else if (activeTab === "brands") {
        await fetchBrands();
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [activeTab, sortOption, selectedCategories]);

  const fetchInfluencers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_influencer', true)
        .order(sortOption === 'alphabetical' ? 'full_name' : 'created_at', 
               { ascending: sortOption === 'alphabetical' });
      
      if (error) {
        console.error("Error fetching influencers:", error);
        setInfluencers([]);
        return;
      }
      
      const formattedInfluencers = data?.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unnamed Influencer',
        username: profile.username || 'unknown',
        avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        category: 'Lifestyle'
      })) || [];
      
      setInfluencers(formattedInfluencers);
    } catch (error) {
      console.error("Error in fetchInfluencers:", error);
      setInfluencers([]);
    }
  };

  const fetchDeals = async () => {
    try {
      let query = getUniversalPromoCodes();
      
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
        console.error("Error fetching deals:", error);
        setDeals([]);
        return;
      }
      
      const formattedDeals = data?.map((deal: UniversalPromoCode) => ({
        id: deal.id || "",
        title: deal.description || "",
        brandName: deal.brand_name || "",
        discount: deal.promo_code || "",
        promoCode: deal.promo_code || "",
        expiryDate: deal.expiration_date,
        affiliateLink: deal.affiliate_link || "#",
        influencerName: deal.influencer_name || 'Unknown Influencer',
        influencerImage: deal.influencer_image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        influencerId: deal.influencer_id || "",
        category: deal.category || 'Fashion'
      })) || [];
      
      setDeals(formattedDeals);
    } catch (error) {
      console.error("Error in fetchDeals:", error);
      setDeals([]);
    }
  };

  const fetchBrands = async () => {
    try {
      let query = getUniversalPromoCodes();
      
      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching brands:", error);
        setBrands([]);
        return;
      }
      
      const brandMap = new Map<string, number>();
      
      data?.forEach((deal: UniversalPromoCode) => {
        if (deal.brand_name) {
          const currentCount = brandMap.get(deal.brand_name) || 0;
          brandMap.set(deal.brand_name, currentCount + 1);
        }
      });
      
      let brandsArray: Brand[] = Array.from(brandMap).map(([name, count]) => ({
        name,
        dealCount: count
      }));
      
      if (sortOption === 'alphabetical') {
        brandsArray.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortOption === 'discount') {
        brandsArray.sort((a, b) => b.dealCount - a.dealCount);
      } else {
        brandsArray.sort((a, b) => b.dealCount - a.dealCount);
      }
      
      setBrands(brandsArray);
    } catch (error) {
      console.error("Error in fetchBrands:", error);
      setBrands([]);
    }
  };

  return { influencers, deals, brands, loading };
};
