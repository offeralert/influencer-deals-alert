// This is a read-only file, but we need to make sure it handles the category field

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

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
