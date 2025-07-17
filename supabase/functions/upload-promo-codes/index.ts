import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Set this to false to properly enforce subscription limits
const BYPASS_OFFER_LIMITS = false;

interface PromoCode {
  user_id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date?: string;
  affiliate_link: string;
  brand_url: string;
  category: string; 
  brand_instagram_handle?: string;
}

// Helper function to extract domain from URL with international domain support
function extractDomain(url: string): string | null {
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
    
    // Get the hostname and remove www. prefix if present
    let hostname = parsedUrl.hostname;
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // Split domain into parts
    const parts = hostname.split('.');
    const partsCount = parts.length;
    
    // Handle special cases for country-specific TLDs
    if (partsCount >= 2) {
      // Get the top level domain (last part)
      const topLevelDomain = parts[partsCount - 1];
      
      // Special handling for known country-specific domains
      if (topLevelDomain === 'uk' && partsCount >= 3 && parts[partsCount - 2] === 'co') {
        // Handle .co.uk format
        const secondLevelDomain = parts[partsCount - 3];
        return `${secondLevelDomain}.co.uk`;
      } else if (topLevelDomain === 'au' && partsCount >= 3 && parts[partsCount - 2] === 'com') {
        // Handle .com.au format
        const secondLevelDomain = parts[partsCount - 3];
        return `${secondLevelDomain}.com.au`;
      } else if (topLevelDomain === 'in' && partsCount >= 3 && parts[partsCount - 2] === 'co') {
        // Handle .co.in format
        const secondLevelDomain = parts[partsCount - 3];
        return `${secondLevelDomain}.co.in`;
      } else if (topLevelDomain === 'ca' && partsCount >= 3 && 
                (parts[partsCount - 2] === 'co' || parts[partsCount - 2] === 'com')) {
        // Handle .co.ca and .com.ca formats
        const secondLevelDomain = parts[partsCount - 3];
        return `${secondLevelDomain}.${parts[partsCount - 2]}.ca`;
      }
    }
    
    // Default case: return the domain as is for regular domains or unknown formats
    return hostname;
  } catch (e) {
    console.error("Error parsing URL:", e);
    return null;
  }
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: user, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
      return new Response(
        JSON.stringify({ success: false, error: userError.message }),
        { headers: { "Content-Type": "application/json" }, status: 401 }
      );
    }

    const body = await req.json();
    const promoCodes: PromoCode[] = body.promoCodes;
  
    // Validate required fields
    const hasInvalidData = promoCodes.some(item => 
      !item.user_id || !item.brand_name || !item.promo_code || !item.description || 
      !item.category || !item.affiliate_link || !item.brand_url
    );
    
    if (hasInvalidData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid data. All promo codes must have user_id, brand_name, promo_code, description, category, affiliate_link, and brand_url." 
        }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // Only check subscription limits if not bypassing
    if (!BYPASS_OFFER_LIMITS) {
      console.log("[UPLOAD] Checking subscription limits for user:", user.user.id);
      
      // Check subscription status using the proper edge function
      const { data: subscriptionData, error: subError } = await supabaseClient.functions.invoke('check-subscription');
      
      if (subError) {
        console.error("[UPLOAD] Error checking subscription:", subError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to verify subscription status. Please try again."
          }),
          { headers: { "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      if (subscriptionData) {
        const { subscribed, subscription_tier } = subscriptionData;
        
        console.log(`[UPLOAD] User subscription: ${subscription_tier}, subscribed: ${subscribed}`);
        
        // Get current offer count
        const { count: currentCount } = await supabaseClient
          .from('promo_codes')
          .select('*', { count: 'exact', head: true })
          .eq('influencer_id', user.user.id);
        
        // Calculate max offers based on tier
        let maxOffers = 1; // Starter tier default
        if (subscription_tier === "Boost") maxOffers = 3;
        else if (subscription_tier === "Growth") maxOffers = 10;
        else if (subscription_tier === "Pro") maxOffers = 20;
        else if (subscription_tier === "Elite") maxOffers = Infinity;
        
        console.log(`[UPLOAD] Current offers: ${currentCount}, Max offers: ${maxOffers}, Trying to add: ${promoCodes.length}`);
        
        // Check if this batch would exceed the limit
        if (currentCount !== null && maxOffers !== Infinity && currentCount + promoCodes.length > maxOffers) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `You've reached your limit of ${maxOffers} offers with the ${subscription_tier} plan. You currently have ${currentCount} offers and are trying to add ${promoCodes.length} more.`
            }),
            { headers: { "Content-Type": "application/json" }, status: 403 }
          );
        }
        
        console.log(`[UPLOAD] Subscription check passed. Proceeding with upload.`);
      }
    }

    // Extract domains from brand URLs for promo_domains table
    const domains = new Set<string>();
    promoCodes.forEach(promoCode => {
      if (promoCode.brand_url) {
        const domain = extractDomain(promoCode.brand_url);
        if (domain) {
          domains.add(domain);
          console.log(`[UPLOAD] Extracted domain: ${domain} from brand URL: ${promoCode.brand_url}`);
        }
      }
    });

    // Insert domains into promo_domains table
    if (domains.size > 0) {
      const domainsArray = Array.from(domains).map(domain => ({
        domain,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: domainError } = await supabaseClient
        .from('promo_domains')
        .upsert(domainsArray, { 
          onConflict: 'domain',
          ignoreDuplicates: true 
        });
      
      if (domainError) {
        console.error("[UPLOAD] Error inserting domains:", domainError);
      } else {
        console.log(`[UPLOAD] Successfully inserted ${domains.size} domains into promo_domains table`);
      }
    }

    const { data, error } = await supabaseClient
      .from("promo_codes")
      .insert(
        promoCodes.map((promoCode) => ({
          ...promoCode,
          influencer_id: user.user.id, // Make sure to use influencer_id field
          brand_instagram_handle: promoCode.brand_instagram_handle || ''
        }))
      )
      .select();

    if (error) {
      console.error("[UPLOAD] Database error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`[UPLOAD] Successfully uploaded ${promoCodes.length} promo codes`);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[UPLOAD] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});