
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
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if the user is an influencer and if they're a fake account
    const { data: profileData, error: profileError } = await supabaseClient
      .from("profiles")
      .select("is_influencer, is_fake")
      .eq("id", user.id)
      .single();
    
    if (profileError) throw new Error(`Profile error: ${profileError.message}`);
    if (!profileData?.is_influencer) throw new Error("User is not an influencer");
    
    // If this is a fake account, skip Stripe checks and return default values
    if (profileData?.is_fake) {
      logStep("Fake account detected - skipping Stripe checks");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        influencer_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: "Starter",
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
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
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating as unsubscribed state (Starter tier)");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        influencer_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: "Starter",
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
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
        console.error("Error determining tier:", error);
        // Default to Growth if there's an error determining the tier
        subscriptionTier = "Growth";
      }
    } else {
      logStep("No active subscription found, using Starter tier");
    }

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      influencer_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
