
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, DollarSign, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const WhyJoin = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
        Why Join <span className="gradient-text">Offer Alert</span>
      </h1>
      
      <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
        For influencers and content creators who want to maximize their affiliate marketing potential
      </p>

      {/* Benefits Sections */}
      <div className="space-y-16 mt-16">
        {/* Benefit 1 */}
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="bg-brand-paleGreen dark:bg-brand-dark p-6 rounded-2xl w-full md:w-1/3 flex-shrink-0">
            <DollarSign className="h-12 w-12 text-brand-green mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Turn Codes Into Earnings</h2>
          </div>
          <div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Convert your promo codes and affiliate links into reliable income streams. 
              Our platform ensures your offers reach potential customers exactly when 
              they're ready to make a purchase.
            </p>
          </div>
        </div>

        {/* Benefit 2 */}
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="bg-brand-paleGreen dark:bg-brand-dark p-6 rounded-2xl w-full md:w-1/3 flex-shrink-0">
            <Zap className="h-12 w-12 text-brand-green mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Perfect Timing</h2>
          </div>
          <div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Instead of leaving promo codes buried in a Linktree or Instagram story that disappears, 
              Offer Alert brings your offers to life at the moment your followers are shopping. 
              Your codes are triggered at the point of conversion, when it matters most.
            </p>
          </div>
        </div>
      </div>

      {/* 100% Commission Section */}
      <div className="mt-20 py-12 px-8 bg-brand-paleGreen dark:bg-brand-dark rounded-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Keep What You Earn</h2>
        
        <div className="flex items-start gap-4 max-w-2xl mx-auto">
          <div className="mt-1 bg-brand-green rounded-full p-1 flex-shrink-0">
            <Check className="h-5 w-5 text-white" />
          </div>
          <p className="text-xl">
            <strong>You keep 100% of commissions earned.</strong> No platform cut.
            We believe creators should be rewarded fully for their influence and marketing efforts.
          </p>
        </div>
      </div>

      {/* Testimonials Section (Optional) */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold mb-8 text-center">What Creators Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <p className="italic text-gray-600 dark:text-gray-400 mb-4">
              "My affiliate revenue increased by 35% after joining Offer Alert. The platform makes sure 
              my codes get used at the perfect moment."
            </p>
            <p className="font-medium">— Sarah J., Fashion Influencer</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <p className="italic text-gray-600 dark:text-gray-400 mb-4">
              "I love that my promo codes get visibility when my followers are actually shopping. 
              It's increased my conversion rate significantly."
            </p>
            <p className="font-medium">— Mark T., Tech Reviewer</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-semibold mb-4">Ready to maximize your affiliate earnings?</h3>
        <Link to="/influencer-apply">
          <Button size="lg" className="mt-2">
            Apply as an Influencer <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default WhyJoin;
