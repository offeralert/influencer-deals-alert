
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

interface CsvInfluencer {
  fullName: string;
  socialMediaHandle: string;
  email: string;
  profileImageUrl?: string;
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
    const { influencers } = await req.json() as { influencers: CsvInfluencer[] };

    // Validate the request body
    if (!influencers || !Array.isArray(influencers) || influencers.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body. Expected an array of influencers.',
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

    // Process each influencer
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const influencer of influencers) {
      try {
        // Validate required fields
        if (!influencer.email || !influencer.fullName || !influencer.socialMediaHandle) {
          results.push({
            email: influencer.email || 'unknown',
            success: false,
            error: 'Missing required fields',
          });
          continue;
        }

        // Generate a random password for the user
        const password = Math.random().toString(36).slice(-10);

        // Create a new user in Supabase auth
        const { data: userData, error: authError } = await supabase.auth.admin.createUser({
          email: influencer.email,
          password,
          email_confirm: true, // Skip email verification
          user_metadata: {
            full_name: influencer.fullName,
            avatar_url: influencer.profileImageUrl,
            username: influencer.socialMediaHandle,
          },
        });

        if (authError) {
          results.push({
            email: influencer.email,
            success: false,
            error: authError.message,
          });
          continue;
        }

        // Update the user's profile to mark them as an influencer
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_influencer: true,
          })
          .eq('id', userData.user.id);

        if (profileError) {
          results.push({
            email: influencer.email,
            success: false,
            error: profileError.message,
          });
          continue;
        }

        results.push({
          email: influencer.email,
          success: true,
        });
      } catch (error) {
        results.push({
          email: influencer.email || 'unknown',
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
