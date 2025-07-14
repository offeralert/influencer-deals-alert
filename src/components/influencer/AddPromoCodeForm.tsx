
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader, AlertCircle, RefreshCw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PROMO_CODE_CATEGORIES } from "@/constants/promoCodeConstants";
import { usePromoCodeForm } from "@/hooks/usePromoCodeForm";
import SubscriptionStatus from "@/components/promo-codes/SubscriptionStatus";
import UpgradePlanSection from "@/components/promo-codes/UpgradePlanSection";
import SubscriptionErrorBoundary from "@/components/SubscriptionErrorBoundary";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AddPromoCodeFormProps {
  onPromoCodeAdded?: () => void;
}

const AddPromoCodeForm = ({ onPromoCodeAdded }: AddPromoCodeFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { user, isAuthenticated } = useAuth();
  
  const {
    formData,
    isLoading,
    isLoadingCount,
    currentOfferCount,
    maxOffers,
    subscriptionTier,
    bypassOfferLimits,
    nextTier,
    handleChange,
    handleSelectChange,
    handleSubmit
  } = usePromoCodeForm({ onPromoCodeAdded: onPromoCodeAdded || (() => {}) });

  const { error: subscriptionError, refresh: refreshSubscription } = useSubscription();

  // Check authentication state
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Authentication Required
          </CardTitle>
          <CardDescription>
            You must be logged in to add promo codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Please log in to your account to add promo codes.
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log("[ADD_PROMO] Form submitted", { user: user?.id, formData });
    
    // Validate required fields
    if (!formData.brandName.trim()) {
      toast.error("Brand name is required");
      return;
    }
    
    if (!formData.brandUrl.trim()) {
      toast.error("Brand URL is required");
      return;
    }
    
    if (!formData.brandInstagramHandle.trim()) {
      toast.error("Brand Instagram handle is required");
      return;
    }
    
    if (!formData.promoCode.trim()) {
      toast.error("Promo code is required");
      return;
    }
    
    if (!formData.affiliateLink.trim()) {
      toast.error("Affiliate link is required");
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }

    try {
      // Create a new form data object with the date
      const formDataWithDate = {
        ...formData,
        expirationDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      };
      
      // Update form data in usePromoCodeForm hook
      Object.keys(formDataWithDate).forEach(key => {
        if (key === 'category') {
          handleSelectChange(key, formDataWithDate[key as keyof typeof formDataWithDate] as string);
        } else {
          // Create a synthetic event for other fields
          const syntheticEvent = {
            target: {
              name: key,
              value: formDataWithDate[key as keyof typeof formDataWithDate]
            }
          } as React.ChangeEvent<HTMLInputElement>;
          handleChange(syntheticEvent);
        }
      });
      
      // Call the submit handler directly
      handleSubmit(e);
      
    } catch (error) {
      console.error("[ADD_PROMO] Error in form submission:", error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  // Show subscription error if there's one
  if (subscriptionError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Subscription Error
          </CardTitle>
          <CardDescription>
            Unable to load subscription information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {subscriptionError}
          </p>
          <Button 
            onClick={refreshSubscription}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <SubscriptionErrorBoundary>
      <div className="space-y-6">
        <SubscriptionStatus
          currentOfferCount={currentOfferCount}
          maxOffers={maxOffers}
          subscriptionTier={subscriptionTier}
          bypassOfferLimits={bypassOfferLimits}
          nextTier={nextTier}
        />
        
        <UpgradePlanSection
          currentOfferCount={currentOfferCount}
          maxOffers={maxOffers}
          subscriptionTier={subscriptionTier}
          nextTier={nextTier}
          bypassOfferLimits={bypassOfferLimits}
        />

        <Card>
          <CardHeader>
            <CardTitle>Add New Promo Code</CardTitle>
            <CardDescription>
              Share your latest brand partnerships with your audience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <Input
                    id="brandName"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    placeholder="e.g., Nike, Sephora"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandUrl">Brand Website *</Label>
                  <Input
                    id="brandUrl"
                    name="brandUrl"
                    value={formData.brandUrl}
                    onChange={handleChange}
                    placeholder="e.g., https://nike.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandInstagramHandle">Brand Instagram *</Label>
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
                  <Label htmlFor="promoCode">Promo Code *</Label>
                  <Input
                    id="promoCode"
                    name="promoCode"
                    value={formData.promoCode}
                    onChange={handleChange}
                    placeholder="e.g., SAVE20, NEWUSER"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
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
                  <Label>Expiration Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliateLink">Affiliate Link *</Label>
                <Input
                  id="affiliateLink"
                  name="affiliateLink"
                  value={formData.affiliateLink}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the offer, discount, or product..."
                  className="min-h-[100px]"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isLoadingCount}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Adding Promo Code...
                  </>
                ) : (
                  "Add Promo Code"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SubscriptionErrorBoundary>
  );
};

export default AddPromoCodeForm;
