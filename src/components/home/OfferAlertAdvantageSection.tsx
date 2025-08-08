
import { Instagram, Zap, TrendingUp, Clock } from "lucide-react";

const OfferAlertAdvantageSection = () => {
  const advantages = [
    {
      icon: Instagram,
      title: "Shop on Instagram",
      description: "No app switching - get discount codes while browsing your favorite social platform"
    },
    {
      icon: Zap,
      title: "Instant Response",
      description: "Send a DM and get discount codes back in seconds if available"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "No more hunting for promo codes across multiple websites"
    }
  ];

  return (
    <section className="py-8 md:py-16 bg-gradient-to-br from-brand-paleGreen to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">The Offer Alert Advantage</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12">
            Tired of expired codes or hunting through influencer Linktrees? Because Offer Alert connects directly to influencers, the promo codes convert at a higher rate, deliver bigger savings and drive more commissions for creators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {advantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-brand-paleGreen/20">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-green rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-semibold">{advantage.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground">{advantage.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferAlertAdvantageSection;
