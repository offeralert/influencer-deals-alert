import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Instagram, Chrome, Star, MessageCircle, Zap, Bell } from "lucide-react";

const PromoCodeSolutionsSection = () => {
  const solutions = [
    {
      icon: Instagram,
      title: "Instagram DM - Instant & Easy",
      description: "Shop without leaving Instagram - just send us a DM for instant discount codes",
      steps: [
        "Send a DM to @offeralert.io on Instagram",
        "Get instant discount codes (if available)",
        "Copy the code and save money - stay on Instagram!"
      ],
      ctaText: "Try Instagram DM",
      ctaLink: "https://www.instagram.com/offeralert.io",
      isExternal: true,
      featured: false
    },
    {
      icon: Chrome,
      title: "Browser Extension - Desktop Shoppers",
      description: "Perfect for desktop shopping - get automatic notifications when discount codes are available on any website",
      steps: [
        "Download our free browser extension",
        "Shop on any website as usual",
        "Get automatic notifications when codes are available"
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
                <Card key={index} className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md`}>
                  <CardContent className="p-6 md:p-8">
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-brand-green'}`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{solution.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground">{solution.description}</p>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      {solution.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-brand-green'}`}>
                            <span className="text-white text-sm font-medium">{stepIndex + 1}</span>
                          </div>
                          <p className="text-sm md:text-base text-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                    
                    {index === 1 && (
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="ml-2">Rated 5 stars on Chrome Store</span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <Button size="lg" className={`w-full md:w-auto ${index === 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}`} asChild>
                        <a 
                          href={solution.ctaLink}
                          target={solution.isExternal ? "_blank" : undefined}
                          rel={solution.isExternal ? "noopener noreferrer" : undefined}
                        >
                          {solution.ctaText}
                        </a>
                      </Button>
                     </div>
                     
                      {/* Example section for Instagram DM */}
                      {index === 0 && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border">
                          <h4 className="text-sm font-semibold mb-3 text-center">Try it now - Example</h4>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold">Message to @offeralert.io:</p>
                              </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                "@rarebeauty"
                              </p>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Zap className="w-3 h-3 text-white" />
                              </div>
                              <p className="text-xs text-muted-foreground">Instant response:</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-l-4 border-green-500">
                              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                🎉 Found 1 promo code for Rare Beauty (@rarebeauty):
                                {"\n\n"}
                                Code: SASCHA15
                                {"\n"}
                                Amount: 15% off
                                {"\n"}
                                Link: https://www.rarebeauty.com
                                {"\n"}
                                From: @sascha.skincare
                              </p>
                            </div>
                          </div>
                          <p className="text-center text-xs text-muted-foreground mt-3">
                            Just mention any brand you're shopping at and we'll find you the best deals available.
                          </p>
                        </div>
                      )}
                      
                      {/* Example section for Browser Extension */}
                      {index === 1 && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border">
                          <h4 className="text-sm font-semibold mb-3 text-center">See it in action - Example</h4>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                                <Chrome className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold">Browser Extension on rarebeauty.com:</p>
                              </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                You visit rarebeauty.com to shop for makeup...
                              </p>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <Bell className="w-3 h-3 text-white" />
                              </div>
                              <p className="text-xs text-muted-foreground">Extension notification appears:</p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border-l-4 border-orange-500">
                              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                🎁 Promo codes available for Rare Beauty!
                                {"\n\n"}
                                Code: SASCHA15 (15% off)
                                {"\n"}
                                From: @sascha.skincare
                                {"\n\n"}
                                Click to copy and apply automatically
                              </p>
                            </div>
                          </div>
                          <p className="text-center text-xs text-muted-foreground mt-3">
                            Get automatic notifications on any website when promo codes are available.
                          </p>
                        </div>
                      )}
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