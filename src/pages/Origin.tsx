
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Origin = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          The Origin of <span className="gradient-text">Offer Alert</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          A story of creators getting their power back
        </p>
      </div>

      {/* The Problem Section */}
      <div className="mb-20">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <Shield className="h-8 w-8 text-red-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-bold mb-4 text-red-900 dark:text-red-100">
                The Problem We Discovered
              </h2>
              <p className="text-lg text-red-800 dark:text-red-200 leading-relaxed">
                Honey's lawsuit exposed a shocking truth: browser extensions were systematically 
                stealing commissions from influencers and content creators.
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-red-200 dark:border-red-700">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Creators were working hard to build authentic relationships with their audiences, 
              only to have their commissions intercepted at the last moment by third-party extensions. 
              The very people who drove the sales weren't getting rewarded for their influence.
            </p>
          </div>
        </div>
      </div>

      {/* The Solution Section */}
      <div className="mb-20">
        <div className="bg-brand-paleGreen dark:bg-brand-dark rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <Heart className="h-8 w-8 text-brand-green mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Offer Alert Was Born
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                We created Offer Alert to solve this injustice — by giving that power back to influencers 
                where it rightfully belongs.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 text-brand-green">How It Works</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                When a user lands on a supported brand's website, the Offer Alert extension 
                automatically surfaces the promo codes and affiliate links tied to the 
                influencers they follow.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 text-brand-green">The Result</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                This prevents commissions from being lost and removes the need to bury 
                codes in a Linktree or disappearing Instagram Story.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <Users className="h-12 w-12 text-brand-green mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Our Creator-First Mission
          </h2>
        </div>

        <div className="bg-gradient-to-r from-brand-green to-brand-lightGreen rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl md:text-2xl font-semibold mb-6">
              Influencers keep 100% of the commission they earn through Offer Alert.
            </p>
            <p className="text-lg opacity-90 leading-relaxed">
              We believe creators should be rewarded fully for their influence and marketing efforts. 
              No platform cuts. No hidden fees. Just fair compensation for the value you create.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
        
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-brand-light dark:bg-brand-dark rounded-full p-4 flex items-center justify-center min-w-16">
              <span className="text-2xl font-bold gradient-text">1</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">The Discovery</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Learning about how browser extensions were intercepting creator commissions 
                and realizing the scale of this problem across the influencer economy.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-brand-light dark:bg-brand-dark rounded-full p-4 flex items-center justify-center min-w-16">
              <span className="text-2xl font-bold gradient-text">2</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">The Solution</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Building a platform that puts creators first, ensuring they get the recognition 
                and compensation they deserve for driving sales.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-brand-light dark:bg-brand-dark rounded-full p-4 flex items-center justify-center min-w-16">
              <span className="text-2xl font-bold gradient-text">3</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">The Future</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Continuing to innovate and expand our platform to serve creators better, 
                while maintaining our commitment to 100% commission retention.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-semibold mb-6">
          Join the Creator-First Revolution
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Whether you're a creator looking to maximize your earnings or a shopper wanting 
          to support your favorite influencers, Offer Alert is here for you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup?tab=influencer">
            <Button size="lg" className="w-full sm:w-auto">
              Join as Creator <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Origin;
