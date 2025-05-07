
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

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

    // Get request body to determine which plan to subscribe to
    const reqBody = await req.json();
    const planType = reqBody.planType || "Growth";  // Default to Growth if not specified
    logStep("Request for plan type", { planType });
    
    let priceAmount = 2900;  // Growth plan default
    let productName = "Growth Subscription";
    
    if (planType === "Pro") {
      priceAmount = 4900;
      productName = "Pro Subscription";
    } else if (planType === "Enterprise") {
      priceAmount = 49900;
      productName = "Enterprise Subscription";
    }
    
    logStep("Determined price amount", { priceAmount, productName });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Find or create customer
    let customerId;
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Using existing customer", { customerId });
    } else {
      logStep("No customer found, will create one during checkout");
    }

    // Get the return URL from the request or use a default
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const returnUrl = `${origin}/influencer-dashboard`;
    logStep("Using return URL", { returnUrl });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: productName,
              description: `${planType} subscription for influencers`
            },
            unit_amount: priceAmount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${returnUrl}?subscription=success&plan=${planType}`,
      cancel_url: `${returnUrl}?subscription=canceled`,
      metadata: {
        user_id: user.id,
        plan_type: planType
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
