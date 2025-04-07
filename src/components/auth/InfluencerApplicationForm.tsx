import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PromoCodeEntry {
  id: string;
  brandName: string;
  promoCode: string;
  expirationDate: string;
  affiliateLink: string;
  description: string;
}

const InfluencerApplicationForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    socialHandle: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  
  // State for promo code entries
  const [promoEntries, setPromoEntries] = useState<PromoCodeEntry[]>([
    {
      id: "1",
      brandName: "",
      promoCode: "",
      expirationDate: "",
      affiliateLink: "",
      description: "",
    }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }));
  };

  const addPromoEntry = () => {
    setPromoEntries([
      ...promoEntries,
      {
        id: `${promoEntries.length + 1}`,
        brandName: "",
        promoCode: "",
        expirationDate: "",
        affiliateLink: "",
        description: ""
      }
    ]);
  };

  const updatePromoEntry = (id: string, field: keyof PromoCodeEntry, value: string) => {
    setPromoEntries(
      promoEntries.map(entry => 
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removePromoEntry = (id: string) => {
    if (promoEntries.length > 1) {
      setPromoEntries(promoEntries.filter(entry => entry.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }
    
    // Check if at least one promo entry has required fields
    const hasValidPromo = promoEntries.some(
      entry => entry.brandName.trim() && entry.promoCode.trim() && entry.description.trim()
    );
    
    if (!hasValidPromo) {
      toast.error("Please add at least one valid promo code with brand name, code, and description");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the user account with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.socialHandle,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        console.error("Signup error:", error);
        return;
      }

      // If signup was successful, update the profile with influencer pending status
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            pending_influencer: true,
            application_date: new Date().toISOString()
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          toast.error("Account created but application status couldn't be updated");
          return;
        }

        // Insert promo codes
        const promoCodes = promoEntries
          .filter(entry => entry.brandName.trim() && entry.promoCode.trim())
          .map(entry => ({
            user_id: data.user.id,
            brand_name: entry.brandName,
            promo_code: entry.promoCode,
            description: entry.description,
            expiration_date: entry.expirationDate || null,
            affiliate_link: entry.affiliateLink || null
          }));

        if (promoCodes.length > 0) {
          const { error: promoError } = await supabase
            .from('promo_codes')
            .insert(promoCodes);

          if (promoError) {
            console.error("Error inserting promo codes:", promoError);
            toast.error("Application submitted but promo codes couldn't be saved");
            return;
          }
        }
      }

      toast.success("Application submitted! We'll review your info and get back to you soon.");
      navigate("/login");
    } catch (error) {
      console.error("Unexpected error during application:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Your full name"
          required
          value={formData.fullName}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="socialHandle">Social Media Handle</Label>
        <Input
          id="socialHandle"
          name="socialHandle"
          placeholder="@yourusername"
          required
          value={formData.socialHandle}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Your Promo Codes</h3>
          <Button 
            type="button" 
            variant="outline" 
            onClick={addPromoEntry}
            className="text-brand-green border-brand-green hover:bg-brand-paleGreen hover:text-brand-green"
            disabled={isLoading}
          >
            Add More
          </Button>
        </div>
        
        {promoEntries.map((entry, index) => (
          <div key={entry.id} className="mb-4 border rounded-md p-4 border-brand-paleGreen">
            <div className="flex justify-between mb-2">
              <h4 className="text-sm font-medium">Promo #{index + 1}</h4>
              {promoEntries.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => removePromoEntry(entry.id)}
                  className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={isLoading}
                >
                  Remove
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`brand-${entry.id}`} className="text-xs">Brand Name</Label>
                <Input
                  id={`brand-${entry.id}`}
                  value={entry.brandName}
                  onChange={(e) => updatePromoEntry(entry.id, "brandName", e.target.value)}
                  placeholder="e.g. Nike, Amazon"
                  className="h-8 text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`code-${entry.id}`} className="text-xs">Promo Code</Label>
                <Input
                  id={`code-${entry.id}`}
                  value={entry.promoCode}
                  onChange={(e) => updatePromoEntry(entry.id, "promoCode", e.target.value)}
                  placeholder="e.g. SAVE20"
                  className="h-8 text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`expiry-${entry.id}`} className="text-xs">Expiration Date</Label>
                <Input
                  id={`expiry-${entry.id}`}
                  type="date"
                  value={entry.expirationDate}
                  onChange={(e) => updatePromoEntry(entry.id, "expirationDate", e.target.value)}
                  className="h-8 text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`affiliate-${entry.id}`} className="text-xs">Affiliate Link</Label>
                <Input
                  id={`affiliate-${entry.id}`}
                  value={entry.affiliateLink}
                  onChange={(e) => updatePromoEntry(entry.id, "affiliateLink", e.target.value)}
                  placeholder="https://"
                  className="h-8 text-sm"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1 col-span-2">
                <Label htmlFor={`description-${entry.id}`} className="text-xs">Short Description</Label>
                <Textarea
                  id={`description-${entry.id}`}
                  value={entry.description}
                  onChange={(e) => updatePromoEntry(entry.id, "description", e.target.value)}
                  placeholder="Briefly describe the offer (e.g. 20% off all items)"
                  className="text-sm min-h-[60px]"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="influencer-terms" 
          checked={formData.agreeToTerms}
          onCheckedChange={handleCheckboxChange}
          disabled={isLoading}
        />
        <label 
          htmlFor="influencer-terms" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the Terms of Service and Privacy Policy
        </label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-brand-green hover:bg-brand-green/90 mt-4" 
        disabled={isLoading}
      >
        {isLoading ? "Submitting Application..." : "Submit Influencer Application"}
      </Button>
    </form>
  );
};

export default InfluencerApplicationForm;
