import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    // Create a Supabase client using the Service Role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    
    // Also create a client with the user's auth context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Get the user to verify authorization
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse the request body to get the influencer ID
    let influencerId: string;
    try {
      const { influencerId: reqInfluencerId } = await req.json();
      influencerId = reqInfluencerId || user.id;
    } catch (e) {
      // If JSON parsing fails, default to the authenticated user's ID
      influencerId = user.id;
    }

    // Verify the user is authorized to sync domains for this influencer
    // Only the influencer or an agency managing them can sync
    if (influencerId !== user.id) {
      // Check if user is an agency that manages this influencer
      const { data: managedInfluencer, error: managementError } = await supabaseClient
        .rpc('manages_influencer', { 
          agency_id: user.id,
          influencer_id: influencerId
        });
      
      if (managementError || !managedInfluencer) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "You are not authorized to sync domains for this influencer" 
          }),
          { headers: { "Content-Type": "application/json" }, status: 403 }
        );
      }
    }

    console.log(`[SYNC-DOMAINS] Syncing domains for influencer ${influencerId}`);

    // Get all promo codes for this influencer
    const { data: promoCodes, error: promoCodesError } = await supabaseAdmin
      .from("promo_codes")
      .select("brand_url")
      .eq("influencer_id", influencerId);

    if (promoCodesError) {
      console.error("[SYNC-DOMAINS] Error fetching promo codes:", promoCodesError);
      return new Response(
        JSON.stringify({ success: false, error: promoCodesError.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Extract unique domains from brand URLs
    const domains = new Set<string>();
    promoCodes.forEach(promoCode => {
      if (promoCode.brand_url) {
        const domain = extractDomain(promoCode.brand_url);
        if (domain) {
          domains.add(domain);
        }
      }
    });

    console.log(`[SYNC-DOMAINS] Found ${domains.size} unique domains for influencer ${influencerId}`);

    // Get all followers of this influencer
    const { data: followers, error: followersError } = await supabaseAdmin
      .from("follows")
      .select("user_id")
      .eq("influencer_id", influencerId);

    if (followersError) {
      console.error("[SYNC-DOMAINS] Error fetching followers:", followersError);
      return new Response(
        JSON.stringify({ success: false, error: followersError.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`[SYNC-DOMAINS] Found ${followers?.length || 0} followers for influencer ${influencerId}`);

    let addedMappings = 0;
    let errors = 0;

    // For each follower, add mappings for all domains
    for (const follower of followers || []) {
      for (const domain of domains) {
        try {
          // Add domain mapping for this follower-influencer pair
          const { error: insertError } = await supabaseAdmin
            .from("user_domain_map")
            .upsert({
              user_id: follower.user_id,
              influencer_id: influencerId,
              domain: domain
            }, {
              onConflict: 'user_id,influencer_id,domain',
              ignoreDuplicates: true
            });

          if (insertError) {
            console.error(`[SYNC-DOMAINS] Error adding domain mapping:`, insertError);
            errors++;
          } else {
            addedMappings++;
          }
        } catch (e) {
          console.error(`[SYNC-DOMAINS] Exception adding domain mapping:`, e);
          errors++;
        }
      }
    }

    console.log(`[SYNC-DOMAINS] Completed. Added ${addedMappings} mappings with ${errors} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          domainsCount: domains.size, 
          followersCount: followers?.length || 0,
          mappingsAdded: addedMappings,
          errors
        } 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[SYNC-DOMAINS] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});