
import { Link } from "react-router-dom";
import { ArrowRight, Clock, TrendingUp, ArrowRightLeft, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AffiliateProgram = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Offer Alert Affiliate Program</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          Earn a 20% recurring commission on every subscription you refer to Offer Alert.
          Join our affiliate program and create a sustainable passive income stream.
        </p>
        <Button asChild size="lg" className="font-semibold">
          <a 
            href="https://offer-alert.getrewardful.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2"
          >
            Become an Affiliate <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Key Benefits */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-center">Why Join Our Affiliate Program?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">20% Recurring Commission</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Earn 20% of every subscription payment, not just once but for the life of the customer.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">60-Day Cookie Window</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our cookies last for 60 days, giving you credit for referrals even if they sign up later.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <ArrowRightLeft className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Passive Income Stream</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Set up your affiliate links once and earn recurring revenue month after month.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Help Others Succeed</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Help influencers and agencies dramatically improve their promo code conversion rates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-16 bg-gray-50 dark:bg-gray-900 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-8 text-center">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-green-600 mb-4 shadow-md">1</div>
            <h3 className="font-semibold text-lg mb-2">Sign Up</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Register for our affiliate program through our partner, Rewardful. It takes less than 5 minutes.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-green-600 mb-4 shadow-md">2</div>
            <h3 className="font-semibold text-lg mb-2">Share Your Link</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get your unique affiliate link and share it with your network, on your website, or in your emails.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-green-600 mb-4 shadow-md">3</div>
            <h3 className="font-semibold text-lg mb-2">Earn Commissions</h3>
            <p className="text-gray-600 dark:text-gray-400">
              When someone signs up through your link, you'll earn 20% of their subscription fee for as long as they remain a customer.
            </p>
          </div>
        </div>
      </div>

      {/* Convert Better */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Help Improve Conversion Rates</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              By referring influencers and agencies to Offer Alert, you're helping them:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-[20px]">✓</div>
                <span>Centralize and organize all of their promo codes and affiliate links</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-[20px]">✓</div>
                <span>Track performance across multiple platforms in one dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-[20px]">✓</div>
                <span>Increase visibility with an app-based promotional platform</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 min-w-[20px]">✓</div>
                <span>Dramatically improve conversion rates on their promotional efforts</span>
              </li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 text-center">Who Can You Refer?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <span className="font-medium">Influencers</span> looking to increase their promotional conversions
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <span className="font-medium">Marketing Agencies</span> managing multiple influencer accounts
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <span className="font-medium">Content Creators</span> with active promotional partnerships
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <span className="font-medium">Entrepreneurs</span> who use affiliate marketing as a revenue stream
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">How do I get paid?</AccordionTrigger>
            <AccordionContent>
              Payments are processed via PayPal or bank transfer at the beginning of each month for the previous month's commissions, once you've reached the minimum payout threshold of $50.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">What is the commission structure?</AccordionTrigger>
            <AccordionContent>
              You earn a 20% commission on all subscription payments made by customers you refer, for as long as they remain a subscriber. This is a recurring commission on all their future payments.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">How long does the cookie last?</AccordionTrigger>
            <AccordionContent>
              Our affiliate cookies last for 60 days. If someone clicks your link and signs up within that period, you'll receive credit for the referral.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">Can I track my referrals?</AccordionTrigger>
            <AccordionContent>
              Yes, you'll have access to a dashboard where you can track clicks, conversions, and commission earnings in real-time.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left">Is there any cost to join the affiliate program?</AccordionTrigger>
            <AccordionContent>
              No, joining our affiliate program is completely free. There are no fees or charges to participate.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-r from-brand-green to-brand-lightGreen p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Earning?</h2>
        <p className="text-white opacity-90 max-w-2xl mx-auto mb-8">
          Join our affiliate program today and start earning 20% recurring commissions while helping influencers and agencies boost their conversion rates.
        </p>
        <Button asChild size="lg" variant="secondary" className="font-semibold">
          <a 
            href="https://offer-alert.getrewardful.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            Become an Affiliate Today <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default AffiliateProgram;
