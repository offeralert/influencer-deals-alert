
import { useAuth } from "@/contexts/AuthContext";
import StaticOnlyHeroSection from "@/components/home/StaticOnlyHeroSection";
import CallToActionSection from "@/components/home/CallToActionSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import AddToDesktopSection from "@/components/home/AddToDesktopSection";
import WhyItMattersSection from "@/components/home/WhyItMattersSection";
import OfferAlertAdvantageSection from "@/components/home/OfferAlertAdvantageSection";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const { loading } = useAuth();

  // Show loading state only while initial auth check is happening
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

  // Show the educational flow for all users
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
};

export default Index;
