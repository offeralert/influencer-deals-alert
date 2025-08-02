import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Chrome } from "lucide-react";

const PromoCodeSolutionsSection = () => {
  const solutions = [
    {
      icon: MessageSquare,
      title: "Instagram DM Method",
      description: "Get instant promo codes through Instagram direct messages",
      steps: [
        "Browse Instagram and find an influencer you love",
        "Share their profile via DM to @offeralert.io",
        "Instantly receive applicable promo codes and deals"
      ],
      ctaText: "Try DM Method",
      ctaLink: "https://instagram.com/direct/new/?text=@offeralert.io",
      isExternal: true
    },
    {
      icon: Chrome,
      title: "Browser Extension",
      description: "Automatic notifications while you shop online",
      steps: [
        "Install the free browser extension",
        "Shop online as usual on any website",
        "Get automatic notifications when promo codes are available"
      ],
      ctaText: "Download Extension",
      ctaLink: "https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=item-share-cb",
      isExternal: true
    }
  ];

  return (
    <section className="py-8 md:py-16 bg-gradient-to-br from-brand-paleGreen to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Two Ways to Get Promo Codes
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Choose the method that works best for you. Both solutions give you instant access to exclusive influencer promo codes and deals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {solutions.map((solution, index) => {
              const IconComponent = solution.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-brand-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{solution.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground">{solution.description}</p>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      {solution.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-medium">{stepIndex + 1}</span>
                          </div>
                          <p className="text-sm md:text-base text-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <Button size="lg" className="w-full md:w-auto" asChild>
                        <a 
                          href={solution.ctaLink}
                          target={solution.isExternal ? "_blank" : undefined}
                          rel={solution.isExternal ? "noopener noreferrer" : undefined}
                        >
                          {solution.ctaText}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoCodeSolutionsSection;