
import { DealCard } from "@/components/ui/deal-card";
import { PromoCodeWithInfluencer } from "@/utils/supabaseQueries";
import { isExpired, isExpiringSoon } from "@/utils/dateUtils";
import { getAvatarUrl } from "@/utils/avatarUtils";
import { BrowserExtensionCalloutCard } from "./BrowserExtensionCalloutCard";
import { InstagramDMCalloutCard } from "./InstagramDMCalloutCard";

interface BrandPromoCodesProps {
  promoCodes: PromoCodeWithInfluencer[];
  brandName: string;
}

const BrandPromoCodes = ({ promoCodes, brandName }: BrandPromoCodesProps) => {
  if (promoCodes.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Promo Codes & Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <BrowserExtensionCalloutCard brandName={brandName} />
          <InstagramDMCalloutCard brandName={brandName} />
        </div>
        <p className="text-center py-8 text-muted-foreground">
          No promo codes available for this brand yet, but try the tools above to find deals!
        </p>
      </div>
    );
  }

  // Create array with promo codes and call-out cards strategically placed
  const items = [];
  
  // Add first few promo codes
  const firstCodes = promoCodes.slice(0, 3);
  firstCodes.forEach(code => {
    items.push({
      type: 'promo',
      component: (
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
          influencerImage={getAvatarUrl(code.profiles?.avatar_url) || ""}
          influencerUsername={code.profiles?.username || "unknown"}
          category={code.category || ""}
        />
      )
    });
  });

  // Add call-out cards after first 3 codes
  if (promoCodes.length >= 3) {
    items.push({
      type: 'callout',
      component: <BrowserExtensionCalloutCard key="browser-ext" brandName={brandName} />
    });
    items.push({
      type: 'callout',
      component: <InstagramDMCalloutCard key="instagram-dm" brandName={brandName} />
    });
  }

  // Add remaining promo codes
  const remainingCodes = promoCodes.slice(3);
  remainingCodes.forEach(code => {
    items.push({
      type: 'promo',
      component: (
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
          influencerImage={getAvatarUrl(code.profiles?.avatar_url) || ""}
          influencerUsername={code.profiles?.username || "unknown"}
          category={code.category || ""}
        />
      )
    });
  });

  // If less than 3 codes, add call-out cards at the end
  if (promoCodes.length < 3) {
    items.push({
      type: 'callout',
      component: <BrowserExtensionCalloutCard key="browser-ext" brandName={brandName} />
    });
    items.push({
      type: 'callout',
      component: <InstagramDMCalloutCard key="instagram-dm" brandName={brandName} />
    });
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Promo Codes & Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div key={index}>
            {item.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandPromoCodes;
