
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

interface CsvPromoCode {
  influencerEmail: string;
  brandName: string;
  promoCode: string;
  expirationDate?: string;
  affiliateLink?: string;
  description: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }
}

Deno.serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    // Extract the request body
    const { promoCodes } = await req.json() as { promoCodes: CsvPromoCode[] };

    // Validate the request body
    if (!promoCodes || !Array.isArray(promoCodes) || promoCodes.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body. Expected an array of promo codes.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process each promo code
    const results: { code: string; success: boolean; error?: string }[] = [];

    for (const promoCode of promoCodes) {
      try {
        // Validate required fields
        if (!promoCode.influencerEmail || !promoCode.brandName || !promoCode.promoCode || !promoCode.description) {
          results.push({
            code: promoCode.promoCode || 'unknown',
            success: false,
            error: 'Missing required fields',
          });
          continue;
        }

        // Find the influencer by email
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === promoCode.influencerEmail)?.id)
          .single();

        if (userError || !userData) {
          results.push({
            code: promoCode.promoCode,
            success: false,
            error: `Influencer with email ${promoCode.influencerEmail} not found`,
          });
          continue;
        }

        // Insert the promo code
        const { error: insertError } = await supabase.from('promo_codes').insert({
          user_id: userData.id,
          brand_name: promoCode.brandName,
          promo_code: promoCode.promoCode,
          description: promoCode.description,
          expiration_date: promoCode.expirationDate || null,
          affiliate_link: promoCode.affiliateLink || null,
        });

        if (insertError) {
          results.push({
            code: promoCode.promoCode,
            success: false,
            error: insertError.message,
          });
          continue;
        }

        results.push({
          code: promoCode.promoCode,
          success: true,
        });
      } catch (error) {
        results.push({
          code: promoCode.promoCode || 'unknown',
          success: false,
          error: error.message,
        });
      }
    }

    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error: ' + error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
