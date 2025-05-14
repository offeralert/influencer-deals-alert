
// This is a read-only file, but we need to make sure it handles the category field

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

// Set this to true to bypass the offer limit check in edge function
const BYPASS_OFFER_LIMITS = true;

interface PromoCode {
  user_id: string;
  brand_name: string;
  promo_code: string;
  description: string;
  expiration_date?: string;
  affiliate_link?: string;
  category: string; // Make sure category is included
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
  
    // Ensure all promoCodes have the required fields including category
    const hasInvalidData = promoCodes.some(item => 
      !item.user_id || !item.brand_name || !item.promo_code || !item.description || !item.category
    );
    
    if (hasInvalidData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid data. All promo codes must have user_id, brand_name, promo_code, description, and category." 
        }),
        { 
          headers: { "Content-Type": "application/json" },
          status: 400 
        }
      );
    }
    
    // If we're bypassing offer limits, skip the offer count check
    if (!BYPASS_OFFER_LIMITS) {
      // Check subscription limit
      const { data: subscriptionData } = await supabaseClient.functions.invoke('check-subscription');
      
      if (subscriptionData) {
        const { subscribed, subscription_tier } = subscriptionData;
        
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
        
        // Check if this batch would exceed the limit
        if (currentCount !== null && currentCount + promoCodes.length > maxOffers) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `You've reached your limit of ${maxOffers} offers with the ${subscription_tier} plan.`
            }),
            { headers: { "Content-Type": "application/json" }, status: 403 }
          );
        }
      }
    }

    const { data, error } = await supabaseClient
      .from("promo_codes")
      .insert(
        promoCodes.map((promoCode) => ({
          ...promoCode,
          user_id: user.user.id,
        }))
      )
      .select();

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
