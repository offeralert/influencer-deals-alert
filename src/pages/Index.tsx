
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/home/HeroSection";
import DownloadBanner from "@/components/home/DownloadBanner";
import FeaturedInfluencersSection from "@/components/home/FeaturedInfluencersSection";
import FeaturedOffersSection from "@/components/home/FeaturedOffersSection";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import BrowserExtensionPromo from "@/components/home/BrowserExtensionPromo";
import CategoryDealsSection from "@/components/home/CategoryDealsSection";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-white">
        {user ? <DownloadBanner /> : <HeroSection />}
      </div>
      
      {/* Visual divider */}
      <div className="section-divider"></div>
      
      {/* Featured Influencers */}
      <FeaturedInfluencersSection />
      
      {/* Visual divider */}
      <div className="section-divider"></div>
      
      {/* Featured Offers */}
      <FeaturedOffersSection />
      
      {/* Visual divider */}
      <div className="section-divider"></div>
      
      {/* Popular Categories */}
      <PopularCategoriesSection />
      
      {/* Visual divider */}
      <div className="section-divider"></div>
      
      {/* Call to Action */}
      {user ? <BrowserExtensionPromo /> : <CallToActionSection />}
    </div>
  );
};

export default Index;
