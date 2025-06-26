
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/home/HeroSection";
import StaticOnlyHeroSection from "@/components/home/StaticOnlyHeroSection";
import DownloadBanner from "@/components/home/DownloadBanner";
import FeaturedAccountsSection from "@/components/home/FeaturedInfluencersSection";
import FeaturedOffersSection from "@/components/home/FeaturedOffersSection";
import PopularCategoriesSection from "@/components/home/PopularCategoriesSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import BrowserExtensionPromo from "@/components/home/BrowserExtensionPromo";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import AddToDesktopSection from "@/components/home/AddToDesktopSection";
import WhyItMattersSection from "@/components/home/WhyItMattersSection";
import OfferAlertAdvantageSection from "@/components/home/OfferAlertAdvantageSection";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Index = () => {
  const { user, profile, loading, isInfluencer, isAgency } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!loading && user && profile) {
      if (isAgency) {
        navigate("/agency-dashboard");
        return;
      }
      if (isInfluencer) {
        navigate("/influencer-dashboard");
        return;
      }
      // Regular users stay on the homepage but see the logged-in version
    }
  }, [user, profile, loading, isInfluencer, isAgency, navigate]);

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // For non-logged-in users, show the educational flow
  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="section-container">
          <StaticOnlyHeroSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <HowItWorksSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <AddToDesktopSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <WhyItMattersSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <OfferAlertAdvantageSection />
        </div>
        
        <Separator className="h-[1px] bg-gray-100" />
        
        <div className="section-container">
          <CallToActionSection />
        </div>
      </div>
    );
  }

  // For regular authenticated users (not influencers or agencies)
  return (
    <div className="min-h-screen">
      <div className="section-container">
        <DownloadBanner />
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container bg-white shadow-sm">
        <FeaturedOffersSection />
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container bg-white shadow-sm">
        <FeaturedAccountsSection />
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container bg-white shadow-sm">
        <PopularCategoriesSection />
      </div>
      
      <Separator className="h-[1px] bg-gray-100" />
      
      <div className="section-container">
        <BrowserExtensionPromo />
      </div>
    </div>
  );
};

export default Index;
