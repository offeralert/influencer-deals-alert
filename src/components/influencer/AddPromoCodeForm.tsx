
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
import { CATEGORIES } from "@/constants/promoCodeConstants";
import { usePromoCodeForm } from "@/hooks/usePromoCodeForm";
import SubscriptionStatus from "@/components/promo-codes/SubscriptionStatus";
import UpgradePlanSection from "@/components/promo-codes/UpgradePlanSection";
import SubscriptionErrorBoundary from "@/components/SubscriptionErrorBoundary";
import { useSubscription } from "@/hooks/useSubscription";

interface AddPromoCodeFormProps {
  onPromoCodeAdded?: () => void;
}

const AddPromoCodeForm = ({ onPromoCodeAdded }: AddPromoCodeFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Update the expiration date in form data
    const formWithDate = {
      ...formData,
      expirationDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
    };
    
    // Create a new event with updated form data
    const updatedEvent = {
      ...e,
      target: {
        ...e.target,
        elements: Object.keys(formWithDate).map(key => ({
          name: key,
          value: formWithDate[key as keyof typeof formWithDate],
        })),
      },
    };
    
    handleSubmit(updatedEvent as React.FormEvent<HTMLFormElement>);
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
        {isLoadingCount ? (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-center">
                <Loader className="h-6 w-6 animate-spin mr-2" />
                Loading subscription status...
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
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
          </>
        )}

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
                  >
                    <SelectTrigger>
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
                  <Label>Expiration Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
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
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
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
