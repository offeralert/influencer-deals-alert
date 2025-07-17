
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
    const { planType, productId, referralId } = requestData;
    
    if (!planType) {
      throw new Error("Plan type must be specified");
    }

    logStep("Plan type", { planType, productId, referralId });

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

    // Verify the user is an influencer or agency
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_influencer, is_agency")
      .eq("id", user.id)
      .single();
    
    if (profileError || (!profileData?.is_influencer && !profileData?.is_agency)) {
      throw new Error("User is not eligible for subscriptions");
    }
    logStep("Verified user is eligible for subscriptions", { isInfluencer: profileData?.is_influencer, isAgency: profileData?.is_agency });

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
          is_influencer: profileData?.is_influencer ? "true" : "false",
          is_agency: profileData?.is_agency ? "true" : "false",
        },
      });
      customerId = newCustomer.id;
      logStep("Created new customer", { customerId });
    }

    // Determine price ID based on selected plan
    let priceData;
    
    // Check if we have a specific product ID (update with the correct product IDs)
    if (productId === "prod_SH4j01JgfxJSfl") { // Boost plan
      priceData = {
        currency: "usd",
        product: "prod_SH4j01JgfxJSfl", // Boost plan
        unit_amount: 500, // $5/month
        recurring: {
          interval: "month",
        },
      };
      logStep("Using specified product ID for Boost plan", { productId });
    } else if (productId === "prod_SGnRrAW83TfaUf") { // Growth plan
      priceData = {
        currency: "usd",
        product: "prod_SGnRrAW83TfaUf", // Growth plan
        unit_amount: 1200, // $12/month
        recurring: {
          interval: "month",
        },
      };
      logStep("Using specified product ID for Growth plan", { productId });
    } else if (productId === "prod_SGnSw59Chig0Yc") { // Pro plan
      priceData = {
        currency: "usd",
        product: "prod_SGnSw59Chig0Yc", // Pro plan
        unit_amount: 2000, // $20/month
        recurring: {
          interval: "month",
        },
      };
      logStep("Using specified product ID for Pro plan", { productId });
    } else {
      // For other plans, use amount based on plan type
      switch (planType) {
        case "Boost":
          priceData = {
            currency: "usd",
            product: "prod_SH4j01JgfxJSfl", // Updated Boost product ID
            unit_amount: 500, // $5/month
            recurring: {
              interval: "month",
            },
          };
          break;
        case "Growth":
          priceData = {
            currency: "usd",
            product: "prod_SGnRrAW83TfaUf", // Updated Growth product ID
            unit_amount: 1200, // $12/month
            recurring: {
              interval: "month",
            },
          };
          break;
        case "Pro":
          priceData = {
            currency: "usd",
            product: "prod_SGnSw59Chig0Yc", // Updated Pro product ID
            unit_amount: 2000, // $20/month
            recurring: {
              interval: "month",
            },
          };
          break;
        case "Elite":
          priceData = {
            currency: "usd",
            product_data: { 
              name: "Elite Plan",
              description: "Unlimited offers" 
            },
            unit_amount: 49900, // $499/month (though we expect Elite users to use the contact form instead)
            recurring: {
              interval: "month",
            },
          };
          break;
        default:
          throw new Error(`Invalid plan type: ${planType}`);
      }
    }
    
    logStep("Selected pricing plan", { planType, priceData });

    // Create a checkout session with client_reference_id for Rewardful tracking
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    const sessionOptions: any = {
      customer: customerId,
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/pricing?subscription=success&plan=${planType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?subscription=canceled`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_type: planType,
        },
      },
    };
    
    // Add client_reference_id if referral ID exists
    if (referralId) {
      sessionOptions.client_reference_id = referralId;
      logStep("Added referral ID to checkout session", { referralId });
    }
    
    const session = await stripe.checkout.sessions.create(sessionOptions);
    
    logStep("Created checkout session with promo code support", { sessionId: session.id });

    // Save subscription information in the database
    await supabaseAdmin.from("subscribers").upsert({
      email: user.email,
      influencer_id: profileData?.is_influencer ? user.id : null,
      agency_id: profileData?.is_agency ? user.id : null,
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
