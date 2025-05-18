
import React from "react";
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

interface PromoCodeFormData {
  brandName: string;
  brandUrl: string;
  promoCode: string;
  expirationDate: string;
  affiliateLink: string;
  description: string;
  category: string;
}

interface PromoCodeFormFieldsProps {
  formData: PromoCodeFormData;
  isLoading: boolean;
  disabled: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const PromoCodeFormFields = ({
  formData,
  isLoading,
  disabled,
  handleChange,
  handleSelectChange,
  handleSubmit
}: PromoCodeFormFieldsProps) => {
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
            disabled={isLoading || disabled}
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
            disabled={isLoading || disabled}
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
            disabled={isLoading || disabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category*</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
            disabled={isLoading || disabled}
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
            disabled={isLoading || disabled}
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
                  <p className="max-w-xs">This is your affiliate tracking link — you'll earn commissions when users shop through it.</p>
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
            disabled={isLoading || disabled}
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
          disabled={isLoading || disabled}
          className="min-h-[80px]"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full bg-brand-green hover:bg-brand-green/90"
        disabled={isLoading || disabled}
      >
        {isLoading ? "Adding Promo Code..." : "Add Promo Code"}
      </Button>
    </form>
  );
};

export default PromoCodeFormFields;
