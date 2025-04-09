
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/home/HeroSection";
import FeaturedInfluencersSection from "@/components/home/FeaturedInfluencersSection";
import FeaturedOffersSection from "@/components/home/FeaturedOffersSection";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import CallToActionSection from "@/components/home/CallToActionSection";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedInfluencersSection />
      <FeaturedOffersSection />
      <PopularCategoriesSection />
      <CallToActionSection />
    </div>
  );
};

export default Index;
