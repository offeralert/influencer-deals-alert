
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/home/HeroSection";
import FeaturedInfluencersSection from "@/components/home/FeaturedInfluencersSection";
import TrendingDealsSection from "@/components/home/TrendingDealsSection";
import CategoryDealsSection from "@/components/home/CategoryDealsSection";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import CallToActionSection from "@/components/home/CallToActionSection";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedInfluencersSection />
      <TrendingDealsSection />
      <CategoryDealsSection />
      <PopularCategoriesSection />
      <CallToActionSection />
    </div>
  );
};

export default Index;
