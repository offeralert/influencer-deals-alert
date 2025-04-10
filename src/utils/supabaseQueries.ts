
import { supabase } from "@/integrations/supabase/client";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

export interface UniversalPromoCode {
  id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date?: string;
  affiliate_link?: string;
  category: string;
  is_featured?: boolean;
  is_trending?: boolean;
  created_at: string;
  updated_at: string;
  influencer_id: string; // Updated from user_id to match view
  influencer_name?: string;
  influencer_username?: string;
  influencer_image?: string;
}

// Helper function to access the universal_promo_codes view with proper typing
export const getUniversalPromoCodes = () => {
  return supabase
    .from('universal_promo_codes')
    .select('*') as unknown as PostgrestFilterBuilder<any, any, UniversalPromoCode[]>;
};
