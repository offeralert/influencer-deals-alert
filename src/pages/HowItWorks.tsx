
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, MessageCircle, ShoppingBag, Zap, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const HowItWorks = () => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText("@offeralert.io");
    toast.success("Instagram handle copied to clipboard!");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
        Get Instant Discount Codes via <span className="gradient-text">Instagram DM</span>
      </h1>
      <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
        Shop while browsing Instagram and get discount codes instantly. Just DM us!
      </p>

      <div className="space-y-16">
        {/* Step 1 - Send DM */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-6 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-2xl font-semibold mb-4">Send us a DM on Instagram</h2>
            <p className="text-muted-foreground text-lg mb-4">
              Just message us at <span className="font-semibold">@offeralert.io</span> with the brand profile you're shopping at. 
              We'll instantly respond with any available discount codes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={copyToClipboard}
                variant="outline" 
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy @offeralert.io
              </Button>
              <a 
                href="https://ig.me/m/offeralert.io" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Message us now
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Step 2 - Shop While Browsing */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-gradient-to-br from-blue-500 to-green-500 rounded-full p-6 flex items-center justify-center md:order-first">
            <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-2xl font-semibold mb-4">Shop without leaving Instagram</h2>
            <p className="text-muted-foreground text-lg mb-4">
              Stay on the platform you love while shopping. No need to download apps or create accounts. 
              Browse Instagram, see something you like, and get instant savings.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              No app downloads required
            </div>
          </div>
        </div>

        {/* Step 3 - Get Instant Codes */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-6 flex items-center justify-center">
            <Zap className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-2xl font-semibold mb-4">Get codes instantly (if available)</h2>
            <p className="text-muted-foreground text-lg mb-4">
              We'll respond immediately with any discount codes we have for that brand. 
              If codes aren't available, we'll let you know too. Complete transparency, instant results.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-orange-500" />
              Average response time: Under 3 seconds
            </div>
          </div>
        </div>
      </div>

      {/* Example Section */}
      <div className="mt-16 p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border">
        <h2 className="text-2xl font-semibold mb-6 text-center">Try it now - Example</h2>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Message to @offeralert.io:</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300 italic">
                "@rarebeauty"
              </p>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Instant response:</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
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
          <p className="text-center text-sm text-muted-foreground mt-4">
            Just mention any brand you're shopping at and we'll find you the best deals available.
          </p>
        </div>
      </div>

      {/* Influencer Call-to-Action Section */}
      <div className="mt-20 py-12 px-8 bg-brand-paleGreen dark:bg-brand-dark rounded-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Are you an influencer?</h2>
        
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <p className="text-lg">
            Add your promo codes to our database and help your followers save money while you 
            <strong className="text-brand-green"> keep 100% of the commission</strong> from every purchase.
          </p>
          <Link to="/signup?tab=influencer">
            <Button size="lg" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Sign up as an influencer
            </Button>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-semibold mb-4">Ready to start saving?</h3>
        <p className="text-muted-foreground mb-6">Try it now - send us a DM!</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={copyToClipboard}
            size="lg" 
            variant="outline"
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy @offeralert.io
          </Button>
          <a 
            href="https://ig.me/m/offeralert.io" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="lg" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Message us on Instagram
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
