
import { supabase } from "@/integrations/supabase/client";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

export interface PromoCode {
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
  influencer_id: string;
}

export interface PromoCodeWithInfluencer extends PromoCode {
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface DomainMapping {
  user_id: string;
  influencer_id: string;
  domain: string | null;
  id: string;
}

// Helper function to access the promo_codes table with join to profiles
export const getPromoCodes = () => {
  return supabase
    .from('promo_codes')
    .select(`
      *,
      profiles:influencer_id (
        full_name,
        username,
        avatar_url
      )
    `) as unknown as PostgrestFilterBuilder<any, any, PromoCodeWithInfluencer[]>;
};

// Helper function to extract and clean domain from URL with improved robustness
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
    
    // Return the hostname (domain) without www. prefix
    let domain = parsedUrl.hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    return domain;
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
      
      // Process domains one by one with individual error handling
      for (const domain of domainArray) {
        try {
          console.log(`Attempting to insert domain mapping: ${domain} for user ${userId}, influencer ${influencerId}`);
          
          // Use upsert to handle conflicts with the unique constraint
          const { error } = await supabase
            .from('user_domain_map')
            .upsert({
              user_id: userId,
              influencer_id: influencerId,
              domain
            }, { 
              onConflict: 'user_id,influencer_id,domain',
              ignoreDuplicates: true 
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
    // This ensures the user follows the influencer even if domains can't be extracted
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

// Function to update domain mappings when promo codes change
export const syncUserDomainMap = async (
  influencerId: string,
  promoCodeId?: string,
  isDelete: boolean = false
): Promise<{success: boolean, message: string}> => {
  try {
    console.log(`Starting syncUserDomainMap for influencer ${influencerId}, promoCode ${promoCodeId || 'none'}, isDelete: ${isDelete}`);
    
    // First get all followers of this influencer
    const { data: followers, error: followersError } = await supabase
      .from('user_domain_map')
      .select('user_id')
      .eq('influencer_id', influencerId)
      .limit(1000);
    
    if (followersError || !followers || followers.length === 0) {
      console.log(`No followers found for influencer ${influencerId} or error:`, followersError);
      return { success: false, message: followersError ? followersError.message : 'No followers found' };
    }
    
    // Extract unique follower IDs
    const followerIds = [...new Set(followers.map(f => f.user_id))];
    console.log(`Found ${followerIds.length} followers for influencer ${influencerId}`);

    if (isDelete && promoCodeId) {
      // Handle deletion of a specific promo code
      console.log(`Handling deletion of promo code ${promoCodeId}`);
      
      // Get the domain of the deleted promo code
      const { data: deletedPromo } = await supabase
        .from('promo_codes')
        .select('affiliate_link')
        .eq('id', promoCodeId)
        .single();
      
      if (deletedPromo && deletedPromo.affiliate_link) {
        const domain = extractDomain(deletedPromo.affiliate_link);
        if (domain) {
          console.log(`Found domain ${domain} from deleted promo code`);
          
          // Check if this domain exists in other active promo codes of this influencer
          const { data: otherPromos } = await supabase
            .from('promo_codes')
            .select('affiliate_link')
            .eq('influencer_id', influencerId)
            .neq('id', promoCodeId);
          
          const otherDomains = new Set<string>();
          otherPromos?.forEach(promo => {
            if (promo.affiliate_link) {
              const extractedDomain = extractDomain(promo.affiliate_link);
              if (extractedDomain) otherDomains.add(extractedDomain);
            }
          });
          
          // If domain is not used in other promo codes, remove it from user_domain_map
          if (!otherDomains.has(domain)) {
            console.log(`Domain ${domain} not found in other promo codes, removing from user_domain_map`);
            
            for (const userId of followerIds) {
              const { error } = await supabase
                .from('user_domain_map')
                .delete()
                .eq('user_id', userId)
                .eq('influencer_id', influencerId)
                .eq('domain', domain);
              
              if (error) {
                console.error(`Error removing domain mapping for user ${userId}:`, error);
              } else {
                console.log(`Removed domain mapping for user ${userId}`);
              }
            }
          } else {
            console.log(`Domain ${domain} is still used in other promo codes, keeping it in user_domain_map`);
          }
        }
      }
    } else {
      // For additions or general updates, refresh all domain mappings
      console.log(`Refreshing all domain mappings for influencer ${influencerId}`);
      
      // Get all promo codes from this influencer
      const { data: promos, error: promosError } = await supabase
        .from('promo_codes')
        .select('affiliate_link, expiration_date')
        .eq('influencer_id', influencerId);
      
      if (promosError) {
        console.error(`Error fetching promo codes for influencer ${influencerId}:`, promosError);
        return { success: false, message: promosError.message };
      }
      
      const now = new Date();
      const validPromos = promos?.filter(promo => {
        // Filter out expired promo codes
        if (promo.expiration_date) {
          const expiryDate = new Date(promo.expiration_date);
          return expiryDate >= now;
        }
        return true;
      }) || [];
      
      const affiliateLinks = validPromos
        .map(promo => promo.affiliate_link)
        .filter(link => link) as string[];
      
      console.log(`Found ${affiliateLinks.length} valid affiliate links for influencer ${influencerId}`);
      
      // Update domain mappings for each follower
      for (const userId of followerIds) {
        // First delete all existing domain mappings for this user-influencer pair
        await supabase
          .from('user_domain_map')
          .delete()
          .eq('user_id', userId)
          .eq('influencer_id', influencerId);
        
        // Then add new domain mappings based on current promo codes
        await addDomainMappings(userId, influencerId, affiliateLinks);
      }
    }
    
    return { success: true, message: 'Domain mappings updated successfully' };
  } catch (error: any) {
    console.error(`Error in syncUserDomainMap:`, error);
    return { success: false, message: error?.message || 'Unknown error' };
  }
};
