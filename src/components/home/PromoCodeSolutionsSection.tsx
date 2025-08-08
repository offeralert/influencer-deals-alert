import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Chrome } from "lucide-react";

const PromoCodeSolutionsSection = () => {
  const solutions = [
    {
      icon: Instagram,
      title: "Instagram DM - Instant & Easy",
      description: "Shop without leaving Instagram - just send us a DM for instant discount codes",
      steps: [
        "Send a DM to @offeralert.io on Instagram",
        "Tell us what brand or product you're shopping for",
        "Get instant discount codes (if available)",
        "Copy the code and save money - stay on Instagram!"
      ],
      ctaText: "Try Instagram DM",
      ctaLink: "https://www.instagram.com/offeralert.io",
      isExternal: true,
      featured: true
    },
    {
      icon: Chrome,
      title: "Browser Extension",
      description: "Get automatic notifications when discount codes are available on any website",
      steps: [
        "Download our free browser extension",
        "Shop on any website as usual",
        "Get automatic notifications when codes are available",
        "Apply codes instantly at checkout"
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
                <Card key={index} className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md ${solution.featured ? 'ring-2 ring-brand-green ring-opacity-50 relative' : ''}`}>
                  {solution.featured && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${solution.featured ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-brand-green'}`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{solution.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground">{solution.description}</p>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      {solution.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${solution.featured ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-brand-green'}`}>
                            <span className="text-white text-sm font-medium">{stepIndex + 1}</span>
                          </div>
                          <p className="text-sm md:text-base text-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <Button size="lg" className={`w-full md:w-auto ${solution.featured ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}`} asChild>
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