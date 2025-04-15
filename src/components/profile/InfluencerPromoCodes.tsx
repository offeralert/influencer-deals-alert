
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DealCard } from "@/components/ui/deal-card";
import { UniversalPromoCode } from "@/utils/supabaseQueries";

interface InfluencerPromoCodesProps {
  promoCodes: UniversalPromoCode[];
  influencerId: string;
  influencerName: string;
  influencerImage: string;
}

const InfluencerPromoCodes = ({
  promoCodes,
  influencerId,
  influencerName,
  influencerImage
}: InfluencerPromoCodesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promo Codes & Deals</CardTitle>
      </CardHeader>
      <CardContent>
        {promoCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {promoCodes.map((promoCode) => (
              <DealCard
                key={promoCode.id}
                id={influencerId}
                title={promoCode.description}
                brandName={promoCode.brand_name}
                discount={promoCode.promo_code}
                promoCode={promoCode.promo_code}
                expiryDate={promoCode.expiration_date}
                affiliateLink={promoCode.affiliate_link || "#"}
                influencerName={influencerName}
                influencerImage={influencerImage}
                category={promoCode.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              This influencer hasn't shared any promo codes yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfluencerPromoCodes;
