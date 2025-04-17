
import { useAuth } from "@/contexts/AuthContext";
import HeroSection from "@/components/home/HeroSection";
import DownloadBanner from "@/components/home/DownloadBanner";
import FeaturedInfluencersSection from "@/components/home/FeaturedInfluencersSection";
import FeaturedOffersSection from "@/components/home/FeaturedOffersSection";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import BrowserExtensionPromo from "@/components/home/BrowserExtensionPromo";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className={`min-h-screen ${user ? 'pb-0' : ''}`}>
      {user ? <DownloadBanner /> : <HeroSection />}
      <FeaturedInfluencersSection />
      <FeaturedOffersSection />
      <PopularCategoriesSection />
      {user ? <BrowserExtensionPromo /> : <CallToActionSection />}
    </div>
  );
};

export default Index;
