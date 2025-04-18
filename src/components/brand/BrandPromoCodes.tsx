
import { DealCard } from "@/components/ui/deal-card";
import { UniversalPromoCode } from "@/utils/supabaseQueries";

interface BrandPromoCodesProps {
  promoCodes: UniversalPromoCode[];
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
            influencerName={code.influencer_name || ""}
            influencerImage={code.influencer_image || ""}
            influencerId={code.influencer_id || ""} 
            category={code.category || ""}
          />
        ))}
      </div>
    </div>
  );
};

export default BrandPromoCodes;
