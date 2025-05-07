
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Initialize Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user is an influencer
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("is_influencer")
      .eq("id", user.id)
      .single();
    
    if (profileError) throw new Error(`Profile error: ${profileError.message}`);
    if (!profileData?.is_influencer) throw new Error("User is not an influencer");
    logStep("Verified user is an influencer");

    // Check if the user already has a Stripe customer ID
    const { data: subscriber } = await supabaseClient
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Try to find customer either from our DB or by email lookup
    let customerId = subscriber?.stripe_customer_id;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length === 0) {
        throw new Error("No Stripe customer found for this user");
      }
      customerId = customers.data[0].id;
      
      // Update our DB with the found customer ID
      await supabaseClient
        .from("subscribers")
        .upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });
    }
    
    logStep("Found Stripe customer", { customerId });

    const origin = req.headers.get("origin") || "http://localhost:5173";
    const returnUrl = `${origin}/influencer-dashboard`;
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    logStep("Customer portal session created", { sessionId: portalSession.id, url: portalSession.url });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
