
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PromoCode {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date: string | null;
  affiliate_link: string | null;
}

interface PromoCodeEditorProps {
  promoCode: PromoCode;
  onSave: () => void;
  onCancel: () => void;
}

const PromoCodeEditor = ({ promoCode, onSave, onCancel }: PromoCodeEditorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    brandName: promoCode.brand_name,
    promoCode: promoCode.promo_code,
    expirationDate: promoCode.expiration_date || "",
    affiliateLink: promoCode.affiliate_link || "",
    description: promoCode.description,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.brandName.trim() || !formData.promoCode.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("promo_codes")
        .update({
          brand_name: formData.brandName,
          promo_code: formData.promoCode,
          description: formData.description,
          expiration_date: formData.expirationDate || null,
          affiliate_link: formData.affiliateLink || null,
        })
        .eq("id", promoCode.id);

      if (error) {
        toast.error("Failed to update promo code");
        console.error("Error updating promo code:", error);
        return;
      }

      toast.success("Promo code updated successfully!");
      onSave();
    } catch (error) {
      console.error("Unexpected error updating promo code:", error);
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
          required
          disabled={isLoading}
          className="min-h-[80px]"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-brand-green hover:bg-brand-green/90"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default PromoCodeEditor;
