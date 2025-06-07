import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DealCard } from "@/components/ui/deal-card";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/components/CategoryFilter";
import { getPromoCodes, PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { getAvatarUrl } from "@/utils/avatarUtils";

interface Deal {
  id: string;
  title: string;
  brandName: string;
  imageUrl: string;
  discount: string;
  promoCode: string;
  expiryDate?: string;
  affiliateLink: string;
  influencerName: string;
  influencerImage: string;
  influencerUsername: string;
  category: string;
}

const CategoryDealsSection = () => {
  const [categoryDeals, setCategoryDeals] = useState<Record<string, Deal[]>>({});
  const [featuredCategory, setFeaturedCategory] = useState("Fashion");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryDeals();
  }, []);

  const fetchCategoryDeals = async () => {
    try {
      setLoading(true);
      const { data: influencerProfiles, error: influencerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_influencer', true);
      
      if (influencerError) {
        console.error("Error fetching influencer profiles:", influencerError);
        return;
      }
      
      const influencerIds = influencerProfiles.map(profile => profile.id);
      
      if (influencerIds.length === 0) {
        setLoading(false);
        return;
      }
      
      const dealsMap: Record<string, Deal[]> = {};
      const today = new Date();
      
      for (const category of CATEGORIES) {
        const { data, error } = await getPromoCodes()
          .eq('category', category)
          .in('influencer_id', influencerIds)
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (!error && data && Array.isArray(data) && data.length > 0) {
          const validDeals = data.filter(deal => {
            const isValid = deal.brand_name && deal.promo_code && deal.description;
            const isNotExpired = !deal.expiration_date || new Date(deal.expiration_date) > today;
            return isValid && isNotExpired;
          });
          
          const formattedDeals = validDeals.map(deal => ({
            id: deal.id || "",
            title: deal.description || "",
            brandName: deal.brand_name || "",
            imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
            discount: deal.promo_code || "",
            promoCode: deal.promo_code || "",
            expiryDate: deal.expiration_date,
            affiliateLink: deal.affiliate_link || "#",
            influencerName: deal.profiles?.full_name || 'Unknown Influencer',
            influencerImage: getAvatarUrl(deal.profiles?.avatar_url) || "",
            influencerUsername: deal.profiles?.username || 'unknown',
            category: deal.category || ""
          }));
          
          if (formattedDeals.length > 0) {
            dealsMap[category] = formattedDeals;
          }
        }
      }
      
      setCategoryDeals(dealsMap);
      
      let maxDeals = 0;
      let categoryWithMostDeals = "Fashion";
      
      Object.entries(dealsMap).forEach(([category, deals]) => {
        if (deals.length > maxDeals) {
          maxDeals = deals.length;
          categoryWithMostDeals = category;
        }
      });
      
      setFeaturedCategory(categoryWithMostDeals);
    } catch (error) {
      console.error("Error in fetchCategoryDeals:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Loading category deals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!categoryDeals[featuredCategory] || categoryDeals[featuredCategory].length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Top {featuredCategory} Deals</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/explore?category=${featuredCategory}`} className="flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryDeals[featuredCategory].map((deal) => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryDealsSection;
