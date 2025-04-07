
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

interface PromoCodeFormProps {
  onPromoCodeAdded: () => void;
}

const PromoCodeForm = ({ onPromoCodeAdded }: PromoCodeFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: "",
    promoCode: "",
    expirationDate: "",
    affiliateLink: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    setIsLoading(true);

    try {
      const { error } = await supabase.from("promo_codes").insert({
        user_id: user.id,
        brand_name: formData.brandName,
        promo_code: formData.promoCode,
        description: formData.description,
        expiration_date: formData.expirationDate || null,
        affiliate_link: formData.affiliateLink || null,
      });

      if (error) {
        toast.error("Failed to add promo code");
        console.error("Error adding promo code:", error);
        return;
      }

      toast.success("Promo code added successfully!");
      
      // Reset form
      setFormData({
        brandName: "",
        promoCode: "",
        expirationDate: "",
        affiliateLink: "",
        description: "",
      });
      
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
            
            <div className="space-y-2">
              <Label htmlFor="affiliateLink">Affiliate Link</Label>
              <Input
                id="affiliateLink"
                name="affiliateLink"
                value={formData.affiliateLink}
                onChange={handleChange}
                placeholder="https://"
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
              placeholder="Briefly describe the offer (e.g. 20% off all items)"
              required
              disabled={isLoading}
              className="min-h-[80px]"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-brand-green hover:bg-brand-green/90"
            disabled={isLoading}
          >
            {isLoading ? "Adding Promo Code..." : "Add Promo Code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PromoCodeForm;
