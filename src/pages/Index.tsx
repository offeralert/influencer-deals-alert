
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/home/HeroSection";
import FeaturedInfluencersSection from "@/components/home/FeaturedInfluencersSection";
import FeaturedOffersSection from "@/components/home/FeaturedOffersSection";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import TrendingDealsSection from "@/components/home/TrendingDealsSection";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedInfluencersSection />
      <FeaturedOffersSection />
      <TrendingDealsSection />
      <PopularCategoriesSection />
      <CallToActionSection />
    </div>
  );
};

export default Index;
