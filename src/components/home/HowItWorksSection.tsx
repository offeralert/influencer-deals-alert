
import { User, Download, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: User,
      title: "Create Your Account",
      description: "Follow the influencers you love or who have the best deals ;)",
      isClickable: true,
      link: "/signup"
    },
    {
      icon: Download,
      title: "Get Offer Alerts",
      description: "Download the Browser Extension and automatically get notified of the influencers' promo codes and affiliate links while you shop online.",
      isClickable: true,
      link: "https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb",
      isExternal: true
    },
    {
      icon: Heart,
      title: "Everyone Wins",
      description: "You save money and Influencers keep 100% of commissions",
      isClickable: false
    }
  ];

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              
              const stepContent = (
                <div className={`flex flex-col items-center text-center space-y-4 ${step.isClickable ? 'cursor-pointer hover:transform hover:scale-105 transition-all duration-200' : ''}`}>
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-green rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );

              if (step.isClickable && step.isExternal) {
                return (
                  <a
                    key={index}
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {stepContent}
                  </a>
                );
              } else if (step.isClickable) {
                return (
                  <Link key={index} to={step.link} className="block">
                    {stepContent}
                  </Link>
                );
              } else {
                return (
                  <div key={index}>
                    {stepContent}
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
