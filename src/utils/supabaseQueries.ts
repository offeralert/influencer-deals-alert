
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
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return null;
    }
    
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
// Now properly handles multiple domains with improved debugging
export const addDomainMappings = async (
  userId: string, 
  influencerId: string, 
  affiliateLinks: string[]
): Promise<{success: boolean, domainsAdded: number, failures: number}> => {
  try {
    console.log(`Starting addDomainMappings for user ${userId}, influencer ${influencerId} with ${affiliateLinks.length} links`);
    
    // Extract domains from affiliate links
    const domains = new Set<string>();
    const invalidUrls: string[] = [];
    
    affiliateLinks.forEach(link => {
      if (!link) {
        console.log("Skipping empty link");
        return;
      }
      
      const domain = extractDomain(link);
      if (domain) {
        domains.add(domain);
        console.log(`Extracted domain: ${domain} from link: ${link}`);
      } else {
        invalidUrls.push(link);
        console.log(`Failed to extract domain from: ${link}`);
      }
    });
    
    console.log(`Extracted ${domains.size} unique domains from ${affiliateLinks.length} links`);
    if (invalidUrls.length > 0) {
      console.log(`Failed to parse ${invalidUrls.length} URLs:`, invalidUrls);
    }
    
    let successCount = 0;
    let failureCount = 0;
    
    // Process each domain individually with detailed logging
    if (domains.size > 0) {
      const domainArray = Array.from(domains);
      console.log(`Processing domains for insertion: ${domainArray.join(', ')}`);
      
      // Insert each domain as a separate row
      for (const domain of domainArray) {
        try {
          console.log(`Attempting to insert domain mapping: ${domain} for user ${userId}, influencer ${influencerId}`);
          
          const { error } = await supabase
            .from('user_domain_map')
            .upsert({
              user_id: userId,
              influencer_id: influencerId,
              domain
            }, { 
              onConflict: 'user_id,influencer_id,domain'
            });
          
          if (error) {
            console.error(`Error adding domain mapping for ${domain}:`, error);
            failureCount++;
          } else {
            console.log(`Successfully added domain mapping for ${domain}`);
            successCount++;
          }
        } catch (err) {
          console.error(`Exception adding domain mapping for ${domain}:`, err);
          failureCount++;
        }
      }
    }
    
    // If no domains were successfully added, fall back to a null domain
    if (successCount === 0) {
      try {
        console.log(`No domains were successfully added, falling back to null domain mapping`);
        
        const { error } = await supabase
          .from('user_domain_map')
          .upsert({
            user_id: userId,
            influencer_id: influencerId,
            domain: null
          }, { 
            onConflict: 'user_id,influencer_id,domain'
          });
        
        if (error) {
          console.error("Error adding null domain mapping:", error);
          failureCount++;
        } else {
          console.log("Successfully added null domain mapping");
          successCount++;
        }
      } catch (err) {
        console.error("Exception adding null domain mapping:", err);
        failureCount++;
      }
    }
    
    const result = {
      success: successCount > 0,
      domainsAdded: successCount,
      failures: failureCount
    };
    
    console.log(`Domain mapping complete:`, result);
    return result;
  } catch (error) {
    console.error("Error in addDomainMappings:", error);
    return {
      success: false,
      domainsAdded: 0,
      failures: 1
    };
  }
};
