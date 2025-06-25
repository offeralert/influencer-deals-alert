
import { ShoppingBag, Plane, Gift } from "lucide-react";

const WhyItMattersSection = () => {
  const useCases = [
    {
      icon: ShoppingBag,
      title: "Skincare",
      description: "Never miss beauty deals from your favorite creators"
    },
    {
      icon: Plane,
      title: "Travel",
      description: "Book trips with exclusive influencer discounts"
    },
    {
      icon: Gift,
      title: "Gifts",
      description: "Find perfect presents while supporting creators"
    }
  ];

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Why it Matters</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-12">
            Whether you're buying skincare, booking a trip, or browsing for gifts, Offer Alert makes sure you never miss a deal - and every purchase supports the influencers you trust.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-paleGreen rounded-full flex items-center justify-center">
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-brand-green" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-semibold">{useCase.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{useCase.description}</p>
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

export default WhyItMattersSection;
