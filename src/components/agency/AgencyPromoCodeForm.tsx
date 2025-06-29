
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PROMO_CODE_CATEGORIES } from "@/constants/promoCodeConstants";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractDomain } from "@/utils/supabaseQueries";

interface AgencyPromoCodeFormProps {
  influencerId: string;
  onPromoCodeAdded: () => void;
}

const AgencyPromoCodeForm = ({ influencerId, onPromoCodeAdded }: AgencyPromoCodeFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: "",
    brandUrl: "",
    brandInstagramHandle: "",
    promoCode: "",
    expirationDate: "",
    affiliateLink: "",
    description: "",
    category: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Auto-format Instagram handle
    if (name === 'brandInstagramHandle') {
      let formattedValue = value.trim();
      if (formattedValue && !formattedValue.startsWith('@')) {
        formattedValue = '@' + formattedValue;
      }
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateFollowerDomains = async (influencerId: string, brandUrl: string) => {
    try {
      const domain = extractDomain(brandUrl);
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

    if (!formData.brandName.trim() || !formData.brandInstagramHandle.trim() || !formData.promoCode.trim() || !formData.description.trim() || !formData.affiliateLink.trim() || !formData.brandUrl.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate Instagram handle format
    if (!formData.brandInstagramHandle.match(/^@[a-zA-Z0-9._]+$/)) {
      toast.error("Please enter a valid Instagram handle (e.g., @brandname)");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("promo_codes")
        .insert({
          brand_name: formData.brandName,
          brand_url: formData.brandUrl,
          brand_instagram_handle: formData.brandInstagramHandle,
          promo_code: formData.promoCode,
          description: formData.description,
          expiration_date: formData.expirationDate || null,
          affiliate_link: formData.affiliateLink,
          category: formData.category,
          influencer_id: influencerId,
        });

      if (error) {
        toast.error("Failed to add promo code");
        console.error("Error adding promo code:", error);
        return;
      }

      // Update domain mappings for followers
      await updateFollowerDomains(influencerId, formData.brandUrl);

      toast.success("Promo code added successfully!");
      
      // Reset form
      setFormData({
        brandName: "",
        brandUrl: "",
        brandInstagramHandle: "",
        promoCode: "",
        expirationDate: "",
        affiliateLink: "",
        description: "",
        category: "",
      });
      
      onPromoCodeAdded();
    } catch (error) {
      console.error("Unexpected error adding promo code:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="brandInstagramHandle">Brand Instagram Handle*</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">This Instagram handle will be used for our Instagram DM functionality to automatically respond with this promo code when users send brand posts to our account.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="brandInstagramHandle"
            name="brandInstagramHandle"
            value={formData.brandInstagramHandle}
            onChange={handleChange}
            placeholder="@brandname"
            required
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="brandUrl">Brand URL*</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">This URL is used by the browser extension to trigger offer notifications.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="brandUrl"
            name="brandUrl"
            type="url"
            value={formData.brandUrl}
            onChange={handleChange}
            placeholder="https://example.com"
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category*</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {PROMO_CODE_CATEGORIES.map((category) => (
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
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="affiliateLink">Affiliate Link*</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">This is the affiliate tracking link — commissions will be earned when users shop through it.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="affiliateLink"
            name="affiliateLink"
            value={formData.affiliateLink}
            onChange={handleChange}
            placeholder="https://"
            required
            disabled={isLoading}
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
          placeholder="10% off"
          required
          disabled={isLoading}
          className="min-h-[60px]"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-600/90"
        disabled={isLoading}
      >
        {isLoading ? "Adding Promo Code..." : "Add Promo Code"}
      </Button>
    </form>
  );
};

export default AgencyPromoCodeForm;
