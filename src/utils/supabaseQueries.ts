
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

export interface DomainMapping {
  user_id: string;
  influencer_id: string;
  domain: string | null;
}

// Helper function to access the universal_promo_codes view with proper typing
export const getUniversalPromoCodes = () => {
  return supabase
    .from('universal_promo_codes')
    .select('*') as unknown as PostgrestFilterBuilder<any, any, UniversalPromoCode[]>;
};

// Helper function to extract domain from URL with improved robustness
export const extractDomain = (url: string): string | null => {
  try {
    // Check if URL has a scheme, if not add https://
    let parsedUrl: URL;
    if (url.match(/^https?:\/\//i)) {
      parsedUrl = new URL(url);
    } else {
      // Add https:// as a fallback scheme
      parsedUrl = new URL(`https://${url}`);
    }
    
    // Return the hostname (domain)
    return parsedUrl.hostname;
  } catch (e) {
    console.error("Error parsing URL:", url, e);
    return null;
  }
};

// Helper function to add domain mappings for a user-influencer pair
export const addDomainMappings = async (
  userId: string, 
  influencerId: string, 
  affiliateLinks: string[]
): Promise<boolean> => {
  try {
    // Extract domains from affiliate links
    const domains = new Set<string>();
    
    affiliateLinks.forEach(link => {
      if (!link) return; // Skip empty or null links
      
      const domain = extractDomain(link);
      if (domain) domains.add(domain);
    });
    
    if (domains.size > 0) {
      // Create one entry per domain
      const entries = Array.from(domains).map(domain => ({
        user_id: userId,
        influencer_id: influencerId,
        domain
      }));
      
      // Insert entries, using simple insert - we'll handle errors gracefully
      const { error } = await supabase
        .from('user_domain_map')
        .insert(entries);
      
      if (error) {
        if (error.code === '23505') {
          // This is a duplicate key error, which is expected if user already follows
          // We can safely ignore this and consider the operation successful
          console.log("Some domains were already followed, continuing...");
          return true;
        } else {
          console.error("Error adding domain mappings:", error);
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error in addDomainMappings:", error);
    return false;
  }
};
