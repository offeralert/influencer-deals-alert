
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

    // Verify the user is an influencer or agency
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("is_influencer, is_agency")
      .eq("id", user.id)
      .single();
    
    if (profileError || (!profileData?.is_influencer && !profileData?.is_agency)) {
      throw new Error("User is not eligible for subscriptions");
    }
    logStep("Verified user is eligible for subscriptions", { isInfluencer: profileData?.is_influencer, isAgency: profileData?.is_agency });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, creating new one");
      // Create a new customer if one doesn't exist
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { 
          user_id: user.id,
          is_influencer: profileData?.is_influencer ? "true" : "false",
          is_agency: profileData?.is_agency ? "true" : "false",
        }
      });
      logStep("Created new Stripe customer", { customerId: newCustomer.id });
      
      // Check if they have any subscriptions first
      const subscriptions = await stripe.subscriptions.list({
        customer: newCustomer.id,
        status: "active",
        limit: 1,
      });
      
      if (subscriptions.data.length === 0) {
        throw new Error("No active subscription found. Please subscribe to a plan first.");
      }
    }
    const customerId = customers.data.length > 0 ? customers.data[0].id : null;
    
    if (!customerId) {
      throw new Error("Unable to find or create Stripe customer");
    }
    
    logStep("Found Stripe customer", { customerId });

    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Create portal session with appropriate return URL based on user type
    const returnUrl = profileData?.is_agency ? `${origin}/agency-dashboard` : `${origin}/influencer-dashboard`;
    
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
    
    // Provide a more specific error message if it's about Stripe configuration
    if (errorMessage.includes("No configuration provided")) {
      return new Response(JSON.stringify({ 
        error: "Stripe Customer Portal is not configured. Please set up your Customer Portal settings in the Stripe Dashboard.",
        details: errorMessage
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
