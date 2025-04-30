
import { supabase } from "@/integrations/supabase/client";
import { extractDomain } from "./supabaseQueries";

/**
 * Utility function to migrate existing follows to the new user_domain_map table
 */
export const migrateFollowsToUserDomainMap = async () => {
  try {
    // Get all existing follows
    const { data: follows, error: followsError } = await supabase
      .from('follows')
      .select('*');
    
    if (followsError) {
      console.error("Error fetching follows:", followsError);
      return false;
    }
    
    if (!follows || follows.length === 0) {
      console.log("No follows to migrate");
      return true;
    }
    
    console.log(`Found ${follows.length} follows to migrate`);
    
    // Process each follow
    for (const follow of follows) {
      // Get all promo codes for this influencer
      const { data: promoCodes, error: promoError } = await supabase
        .from('promo_codes')
        .select('affiliate_link')
        .eq('user_id', follow.influencer_id)
        .not('affiliate_link', 'is', null);
      
      if (promoError) {
        console.error(`Error fetching promo codes for influencer ${follow.influencer_id}:`, promoError);
        continue;
      }
      
      // Extract domains from affiliate links
      const domains = new Set<string>();
      promoCodes?.forEach(promo => {
        if (promo.affiliate_link) {
          const domain = extractDomain(promo.affiliate_link);
          if (domain) domains.add(domain);
        }
      });
      
      if (domains.size > 0) {
        // Create domain entries for this follow
        const domainEntries = Array.from(domains).map(domain => ({
          user_id: follow.user_id,
          influencer_id: follow.influencer_id,
          domain
        }));
        
        // Insert entries, ignoring conflicts
        const { error: insertError } = await supabase
          .from('user_domain_map')
          .upsert(domainEntries, { onConflict: 'user_id,influencer_id,domain' });
        
        if (insertError) {
          console.error(`Error inserting domain mappings for follow ${follow.id}:`, insertError);
        }
      } else {
        // If no domains found, still create a relationship with null domain
        const { error: insertError } = await supabase
          .from('user_domain_map')
          .upsert({
            user_id: follow.user_id,
            influencer_id: follow.influencer_id,
            domain: null
          }, { onConflict: 'user_id,influencer_id,domain' });
        
        if (insertError) {
          console.error(`Error inserting null domain mapping for follow ${follow.id}:`, insertError);
        }
      }
    }
    
    console.log("Migration completed successfully");
    return true;
  } catch (error) {
    console.error("Error during migration:", error);
    return false;
  }
};
