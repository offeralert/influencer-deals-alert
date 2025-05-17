
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { usePromoCodeForm } from "@/hooks/usePromoCodeForm";
import SubscriptionStatus from "@/components/promo-codes/SubscriptionStatus";
import PromoCodeFormFields from "@/components/promo-codes/PromoCodeFormFields";
import UpgradePlanSection from "@/components/promo-codes/UpgradePlanSection";

interface PromoCodeFormProps {
  onPromoCodeAdded: () => void;
}

const PromoCodeForm = ({ onPromoCodeAdded }: PromoCodeFormProps) => {
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
  } = usePromoCodeForm({ onPromoCodeAdded });

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoadingCount ? (
          <div className="flex justify-center py-4">Loading...</div>
        ) : (
          <>
            <SubscriptionStatus 
              currentOfferCount={currentOfferCount}
              maxOffers={maxOffers}
              subscriptionTier={subscriptionTier}
              bypassOfferLimits={bypassOfferLimits}
              nextTier={nextTier}
            />
            
            <PromoCodeFormFields 
              formData={formData}
              isLoading={isLoading}
              disabled={!bypassOfferLimits && currentOfferCount >= maxOffers}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleSubmit={handleSubmit}
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
      </CardContent>
    </Card>
  );
};

export default PromoCodeForm;
