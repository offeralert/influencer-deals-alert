
import { DealCard } from "@/components/ui/deal-card";
import { PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { isExpired, isExpiringSoon } from "@/utils/dateUtils";

interface BrandPromoCodesProps {
  promoCodes: PromoCodeWithInfluencer[];
}

const BrandPromoCodes = ({ promoCodes }: BrandPromoCodesProps) => {
  if (promoCodes.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Promo Codes</h2>
        <p className="text-center py-8 text-muted-foreground">
          No promo codes available for this brand yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Promo Codes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {promoCodes.map(code => (
          <DealCard
            key={code.id}
            id={code.id || ""}
            title={code.description || ""}
            brandName={code.brand_name || ""}
            discount={code.promo_code || ""}
            promoCode={code.promo_code || ""}
            expiryDate={code.expiration_date}
            affiliateLink={code.affiliate_link || "#"}
            influencerName={code.profiles?.full_name || "Unknown Influencer"}
            influencerImage={code.profiles?.avatar_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"}
            influencerUsername={code.profiles?.username || "unknown"}
            category={code.category || ""}
          />
        ))}
      </div>
    </div>
  );
};

export default BrandPromoCodes;
