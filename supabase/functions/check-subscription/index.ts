
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header provided");
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email not available");
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if the user is an influencer or agency and if they're a fake account
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("is_influencer, is_agency, is_fake")
      .eq("id", user.id)
      .single();
    
    if (profileError) {
      logStep("ERROR: Profile fetch failed", { error: profileError.message });
      throw new Error(`Profile error: ${profileError.message}`);
    }
    
    // Check if user is eligible for subscriptions (influencer or agency)
    if (!profileData?.is_influencer && !profileData?.is_agency) {
      logStep("ERROR: User is neither an influencer nor agency");
      throw new Error("User is not eligible for subscriptions");
    }
    
    // If this is a fake account, skip Stripe checks and return default values
    if (profileData?.is_fake) {
      logStep("Fake account detected - skipping Stripe checks");
      
      // Ensure subscriber record exists for fake accounts
      const { error: upsertError } = await supabaseClient.from("subscribers").upsert({
        email: user.email,
        influencer_id: profileData?.is_influencer ? user.id : null,
        agency_id: profileData?.is_agency ? user.id : null,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: "Starter",
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      if (upsertError) {
        logStep("ERROR: Failed to upsert fake account subscriber record", { error: upsertError.message });
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: "Starter",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Verified user is an influencer");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("No customer found, updating as unsubscribed state (Starter tier)");
        
        const { error: upsertError } = await supabaseClient.from("subscribers").upsert({
          email: user.email,
          influencer_id: profileData?.is_influencer ? user.id : null,
          agency_id: profileData?.is_agency ? user.id : null,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: "Starter",
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
        
        if (upsertError) {
          logStep("ERROR: Failed to upsert subscriber record", { error: upsertError.message });
        }
        
        return new Response(JSON.stringify({ 
          subscribed: false,
          subscription_tier: "Starter",
          subscription_end: null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      
      const hasActiveSub = subscriptions.data.length > 0;
      let subscriptionTier = "Starter";
      let subscriptionEnd = null;

      if (hasActiveSub) {
        const subscription = subscriptions.data[0];
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
        
        // Determine subscription tier from product ID
        try {
          const items = subscription.items.data;
          if (items && items.length > 0) {
            const item = items[0];
            if (item.price && item.price.product) {
              const productId = typeof item.price.product === 'string' 
                ? item.price.product 
                : item.price.product.id;
              
              // Match by product ID using the updated product IDs
              switch (productId) {
                case 'prod_SH4j01JgfxJSfl':
                  subscriptionTier = "Boost";
                  break;
                case 'prod_SGnRrAW83TfaUf':
                  subscriptionTier = "Growth";
                  break;
                case 'prod_SGnSw59Chig0Yc':
                  subscriptionTier = "Pro";
                  break;
                default:
                  // If we can't determine by product ID, fall back to price
                  const amount = item.price.unit_amount || 0;
                  if (amount <= 500) {
                    subscriptionTier = "Boost";
                  } else if (amount <= 1200) {
                    subscriptionTier = "Growth";
                  } else if (amount <= 2000) {
                    subscriptionTier = "Pro";
                  } else {
                    subscriptionTier = "Elite";
                  }
                  break;
              }
              
              logStep("Determined subscription tier by product ID", { 
                productId, 
                subscriptionTier 
              });
            }
          }
        } catch (error) {
          logStep("ERROR: Error determining tier", { error: error.message });
          // Default to Growth if there's an error determining the tier
          subscriptionTier = "Growth";
        }
      } else {
        logStep("No active subscription found, using Starter tier");
      }

      // Upsert subscriber record
      const { error: upsertError } = await supabaseClient.from("subscribers").upsert({
        email: user.email,
        influencer_id: profileData?.is_influencer ? user.id : null,
        agency_id: profileData?.is_agency ? user.id : null,
        stripe_customer_id: customerId,
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      if (upsertError) {
        logStep("ERROR: Failed to upsert subscriber record", { error: upsertError.message });
        // Don't throw here, still return the subscription data
      }

      logStep("Updated database with subscription info", { 
        subscribed: hasActiveSub, 
        subscriptionTier 
      });
      
      return new Response(JSON.stringify({
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
      
    } catch (stripeError) {
      logStep("ERROR: Stripe API error", { error: stripeError.message });
      
      // Fallback: try to get existing subscription data from database
      const { data: existingSubscriber } = await supabaseClient
        .from("subscribers")
        .select("subscribed, subscription_tier, subscription_end")
        .eq("email", user.email)
        .single();
      
      if (existingSubscriber) {
        logStep("Using cached subscription data due to Stripe error");
        return new Response(JSON.stringify({
          subscribed: existingSubscriber.subscribed,
          subscription_tier: existingSubscriber.subscription_tier || "Starter",
          subscription_end: existingSubscriber.subscription_end
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      // Ultimate fallback: return default values
      logStep("No cached data available, returning default values");
      return new Response(JSON.stringify({
        subscribed: false,
        subscription_tier: "Starter",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
