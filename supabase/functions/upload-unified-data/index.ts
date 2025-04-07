
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InfluencerPromoData {
  fullName: string;
  socialMediaHandle: string;
  email: string;
  profileImageUrl?: string;
  brandName: string;
  promoCode: string;
  expirationDate?: string;
  affiliateLink?: string;
  description: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const requestData = await req.json();
    const data = requestData.data as InfluencerPromoData[];

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid or empty data array provided");
    }

    const results = {
      success: 0,
      failures: 0,
      messages: [] as string[],
    };

    // Process each entry - we'll do this sequentially for simplicity and better error handling
    for (const entry of data) {
      try {
        // Check if the influencer already exists by email
        const { data: influencers, error: influencerError } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("username", entry.email) // Assuming username is used as email
          .single();

        if (influencerError && influencerError.code !== "PGRST116") {
          // PGRST116 is "not found" error, which is expected if the user doesn't exist
          throw new Error(`Error checking for existing influencer: ${influencerError.message}`);
        }

        let userId: string;

        if (!influencers) {
          // Create new influencer
          console.log(`Creating new influencer: ${entry.fullName} (${entry.email})`);
          
          // 1. Create auth user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: entry.email,
            email_confirm: true,
            password: generateRandomPassword(12),
            user_metadata: {
              full_name: entry.fullName,
              avatar_url: entry.profileImageUrl,
            },
          });

          if (authError) {
            throw new Error(`Error creating user: ${authError.message}`);
          }

          if (!authData.user) {
            throw new Error("User creation returned no user data");
          }

          userId = authData.user.id;

          // 2. Update profile with additional info (will be handled by the trigger)
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              username: entry.email,
              is_influencer: true,
              full_name: entry.fullName,
              avatar_url: entry.profileImageUrl,
            })
            .eq("id", userId);

          if (profileError) {
            throw new Error(`Error updating profile: ${profileError.message}`);
          }
        } else {
          // Use existing influencer
          userId = influencers.id;
          console.log(`Using existing influencer with ID: ${userId}`);
        }

        // Create promo code
        const { error: promoError } = await supabase.from("promo_codes").insert({
          user_id: userId,
          brand_name: entry.brandName,
          promo_code: entry.promoCode,
          expiration_date: entry.expirationDate,
          affiliate_link: entry.affiliateLink,
          description: entry.description,
        });

        if (promoError) {
          throw new Error(`Error creating promo code: ${promoError.message}`);
        }

        results.success++;
      } catch (entryError) {
        console.error(`Error processing entry:`, entryError);
        results.failures++;
        results.messages.push(`Error with ${entry.email}: ${entryError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        processed: data.length,
        successful: results.success,
        failed: results.failures,
        messages: results.messages.length > 0 ? results.messages : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in upload-unified-data function:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function generateRandomPassword(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
