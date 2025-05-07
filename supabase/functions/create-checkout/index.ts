
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
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Retrieve the request body
    const requestData = await req.json();
    const { planType } = requestData;
    
    if (!planType) {
      throw new Error("Plan type must be specified");
    }

    logStep("Plan type", { planType });

    // Initialize services
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials are not set");
    }

    // Initialize Supabase client with the service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { auth: { persistSession: false } }
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verify the user is an influencer
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_influencer")
      .eq("id", user.id)
      .single();
    
    if (profileError || !profileData?.is_influencer) {
      throw new Error("User is not an influencer");
    }
    logStep("Verified user is an influencer");

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create a new customer in Stripe
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          is_influencer: "true",
        },
      });
      customerId = newCustomer.id;
      logStep("Created new customer", { customerId });
    }

    // Determine price ID based on selected plan
    let priceId;
    let amount; 
    
    switch (planType) {
      case "Growth":
        // Using test price IDs - replace with your actual price IDs in production
        priceId = Deno.env.get("STRIPE_PRICE_GROWTH") || "price_growth";
        amount = 2900; // $29/month
        break;
      case "Pro":
        priceId = Deno.env.get("STRIPE_PRICE_PRO") || "price_pro";
        amount = 4900; // $49/month
        break;
      case "Enterprise":
        priceId = Deno.env.get("STRIPE_PRICE_ENTERPRISE") || "price_enterprise";
        amount = 49900; // $499/month
        break;
      default:
        throw new Error(`Invalid plan type: ${planType}`);
    }
    
    logStep("Selected pricing plan", { planType, priceId, amount });

    // Create a checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          // Price ID or price data
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planType} Plan`,
              description: `${planType} subscription for Offer Alert`,
            },
            unit_amount: amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/pricing?subscription=success&plan=${planType}`,
      cancel_url: `${origin}/pricing?subscription=canceled`,
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_type: planType,
        },
      },
    });
    
    logStep("Created checkout session", { sessionId: session.id });

    // Save subscription information in the database
    await supabaseAdmin.from("subscribers").upsert({
      email: user.email,
      influencer_id: user.id,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
      // We'll update the rest of the fields when the subscription is successful
    }, { onConflict: 'email' });

    return new Response(JSON.stringify({ 
      url: session.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-CHECKOUT] ERROR: ${errorMessage}`);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
