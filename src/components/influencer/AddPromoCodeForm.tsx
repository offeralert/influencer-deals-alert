
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const AddPromoCodeForm = () => {
  const [formData, setFormData] = useState({
    brandName: "",
    promoCode: "",
    description: "",
    affiliateLink: "",
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Promo Code</CardTitle>
        <CardDescription>
          Create a new promotional code to share with your audience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={formData.brandName}
                onChange={(e) => handleInputChange("brandName", e.target.value)}
                placeholder="Enter brand name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promoCode">Promo Code</Label>
              <Input
                id="promoCode"
                value={formData.promoCode}
                onChange={(e) => handleInputChange("promoCode", e.target.value)}
                placeholder="Enter promo code"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe what this promo code offers"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="affiliateLink">Affiliate Link</Label>
            <Input
              id="affiliateLink"
              type="url"
              value={formData.affiliateLink}
              onChange={(e) => handleInputChange("affiliateLink", e.target.value)}
              placeholder="https://example.com/your-affiliate-link"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="beauty">Beauty</SelectItem>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="food">Food & Beverage</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Add Promo Code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddPromoCodeForm;
