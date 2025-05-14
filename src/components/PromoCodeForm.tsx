import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { extractDomain } from "@/utils/supabaseQueries";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSubscription, BYPASS_OFFER_LIMITS } from "@/hooks/useSubscription";
import { ArrowRight, Info } from "lucide-react";

interface PromoCodeFormProps {
  onPromoCodeAdded: () => void;
}

const CATEGORIES = [
  "Fashion",
  "Fitness",
  "Food",
  "Tech",
  "Home",
  "Jewelry",
  "Travel",
  "Beauty"
];

const SUBSCRIPTION_TIERS = [
  { name: "Starter", maxOffers: 1, price: "Free" },
  { name: "Boost", maxOffers: 3, price: "$12/mo" },
  { name: "Growth", maxOffers: 10, price: "$29/mo" },
  { name: "Pro", maxOffers: 20, price: "$49/mo" },
  { name: "Elite", maxOffers: Infinity, price: "$499/mo" },
];

const PromoCodeForm = ({ onPromoCodeAdded }: PromoCodeFormProps) => {
  const { user } = useAuth();
  const { subscriptionTier, maxOffers, bypassOfferLimits } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: "",
    promoCode: "",
    expirationDate: "",
    affiliateLink: "",
    description: "",
    category: "Fashion", // Default category
  });
  const [currentOfferCount, setCurrentOfferCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  // Get the next tier for upgrade suggestions
  const getNextTier = () => {
    const currentTierIndex = SUBSCRIPTION_TIERS.findIndex(tier => tier.name === subscriptionTier);
    if (currentTierIndex < SUBSCRIPTION_TIERS.length - 1) {
      return SUBSCRIPTION_TIERS[currentTierIndex + 1];
    }
    return null;
  };
  
  const nextTier = getNextTier();

  // Fetch current offer count
  useEffect(() => {
    const fetchOfferCount = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('promo_codes')
          .select('*', { count: 'exact', head: true })
          .eq('influencer_id', user.id);
        
        if (error) throw error;
        setCurrentOfferCount(count || 0);
      } catch (err) {
        console.error("Error fetching offer count:", err);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchOfferCount();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateFollowerDomains = async (influencerId: string, affiliateLink: string | null) => {
    if (!influencerId || !affiliateLink) return;
    
    try {
      // Extract domain from the affiliate link
      const domain = extractDomain(affiliateLink);
      if (!domain) return;
      
      // Get all followers of this influencer
      const { data: followers, error: followerError } = await supabase
        .from('user_domain_map')
        .select('user_id')
        .eq('influencer_id', influencerId)
        .limit(1000);
        
      if (followerError || !followers || followers.length === 0) return;
      
      // Add new domain for each follower
      const domainEntries = followers.map(follower => ({
        user_id: follower.user_id,
        influencer_id: influencerId,
        domain: domain
      }));
      
      await supabase
        .from('user_domain_map')
        .upsert(domainEntries, { 
          onConflict: 'user_id,influencer_id,domain',
          ignoreDuplicates: true 
        });
        
    } catch (error) {
      console.error("Error updating follower domains:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to add promo codes");
      return;
    }

    if (!formData.brandName.trim() || !formData.promoCode.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if user has reached their subscription offer limit
    // BUT bypass the check if BYPASS_OFFER_LIMITS is true
    if (!bypassOfferLimits && currentOfferCount >= maxOffers) {
      // Find the next subscription tier that would accommodate more offers
      let requiredTier = "Boost";
      
      if (currentOfferCount >= 20) {
        requiredTier = "Elite";
      } else if (currentOfferCount >= 10) {
        requiredTier = "Pro";
      } else if (currentOfferCount >= 3) {
        requiredTier = "Growth";
      }
      
      toast.error(`You've reached your limit of ${maxOffers} offers with the ${subscriptionTier} plan.`, {
        action: {
          label: `Upgrade to ${requiredTier}`,
          onClick: () => window.location.href = "/pricing"
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error, data } = await supabase.from("promo_codes").insert({
        influencer_id: user.id,
        brand_name: formData.brandName,
        promo_code: formData.promoCode,
        description: formData.description,
        expiration_date: formData.expirationDate || null,
        affiliate_link: formData.affiliateLink || null,
        category: formData.category,
      }).select();

      if (error) {
        toast.error("Failed to add promo code");
        console.error("Error adding promo code:", error);
        return;
      }

      // Update domain mappings for all followers if there's an affiliate link
      if (formData.affiliateLink) {
        await updateFollowerDomains(user.id, formData.affiliateLink);
      }

      toast.success("Promo code added successfully!");
      
      // Reset form
      setFormData({
        brandName: "",
        promoCode: "",
        expirationDate: "",
        affiliateLink: "",
        description: "",
        category: "Fashion",
      });
      
      // Update the current offer count
      setCurrentOfferCount(prev => prev + 1);
      
      // Show upgrade suggestions if approaching the limit AND not bypassing limits
      if (!bypassOfferLimits && currentOfferCount + 1 >= maxOffers - 1 && nextTier) {
        toast("Running out of offer slots!", {
          description: `You have ${maxOffers - (currentOfferCount + 1)} slots left. Consider upgrading to ${nextTier.name} for ${nextTier.maxOffers} offers.`,
          action: {
            label: "Upgrade Plan",
            onClick: () => window.location.href = "/pricing"
          }
        });
      }
      
      // Notify parent component
      onPromoCodeAdded();
    } catch (error) {
      console.error("Unexpected error adding promo code:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoadingCount ? (
          <div className="flex justify-center py-4">Loading...</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 bg-muted/30 p-4 rounded-lg">
              <div className="space-y-1">
                <div className="text-sm font-medium flex items-center">
                  <span className="mr-2">Current plan:</span>
                  <span className="font-semibold text-primary">{subscriptionTier}</span>
                </div>
                <div className="text-sm flex items-center text-muted-foreground">
                  Using {currentOfferCount} of {bypassOfferLimits 
                    ? "unlimited (temporary promotion)" 
                    : (maxOffers === Infinity ? "unlimited" : maxOffers)} available offers
                </div>
              </div>
              
              {bypassOfferLimits && (
                <div className="flex items-center bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-md text-green-800 dark:text-green-300 text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Unlimited promo submissions enabled!</span>
                </div>
              )}
              
              {!bypassOfferLimits && nextTier && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => window.location.href = "/pricing"}
                >
                  <span>Upgrade to {nextTier.name}</span>
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name*</Label>
                  <Input
                    id="brandName"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    placeholder="e.g. Nike, Amazon"
                    required
                    disabled={isLoading || (!bypassOfferLimits && currentOfferCount >= maxOffers)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="promoCode">Promo Code*</Label>
                  <Input
                    id="promoCode"
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handleChange}
                    placeholder="e.g. SAVE20"
                    required
                    disabled={isLoading || (!bypassOfferLimits && currentOfferCount >= maxOffers)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                    disabled={isLoading || (!bypassOfferLimits && currentOfferCount >= maxOffers)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    name="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    disabled={isLoading || (!bypassOfferLimits && currentOfferCount >= maxOffers)}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="affiliateLink">Affiliate Link</Label>
                  <Input
                    id="affiliateLink"
                    name="affiliateLink"
                    value={formData.affiliateLink}
                    onChange={handleChange}
                    placeholder="https://"
                    disabled={isLoading || (!bypassOfferLimits && currentOfferCount >= maxOffers)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe the offer (e.g. 20% off all items)"
                  required
                  disabled={isLoading || (!bypassOfferLimits && currentOfferCount >= maxOffers)}
                  className="min-h-[80px]"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-brand-green hover:bg-brand-green/90"
                disabled={isLoading || (!bypassOfferLimits && currentOfferCount >= maxOffers)}
              >
                {isLoading ? "Adding Promo Code..." : "Add Promo Code"}
              </Button>

              {!bypassOfferLimits && currentOfferCount >= maxOffers && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm mb-3">
                    You've reached your offer limit with the {subscriptionTier} plan.
                    {nextTier && ` Upgrade to ${nextTier.name} for ${nextTier.maxOffers === Infinity ? 'unlimited' : nextTier.maxOffers} offers.`}
                  </p>
                  <Button 
                    variant="default" 
                    className="text-sm"
                    onClick={() => window.location.href = "/pricing"}
                  >
                    Upgrade Plan
                  </Button>
                </div>
              )}
              
              {bypassOfferLimits && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center text-green-800 dark:text-green-300">
                  <p className="text-sm">
                    <span className="font-semibold">Limited time promotion:</span> Submit unlimited promo codes regardless of your plan tier!
                  </p>
                </div>
              )}
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PromoCodeForm;
