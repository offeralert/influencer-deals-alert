import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Database {
  public: {
    Tables: {
      promo_codes: {
        Row: {
          id: string;
          influencer_id: string;
          brand_name: string;
          brand_url: string;
          brand_instagram_handle: string;
          promo_code: string;
          description: string;
          expiration_date: string | null;
          affiliate_link: string;
          category: string;
          created_at: string;
          updated_at: string;
          agency_id: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          is_influencer: boolean | null;
          is_agency: boolean | null;
        };
      };
      user_domain_map: {
        Row: {
          id: string;
          user_id: string;
          influencer_id: string;
          domain: string | null;
        };
      };
    };
    Functions: {
      extract_domain: {
        Args: { url: string };
        Returns: string;
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get domain from query parameters
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain');

    if (!domain) {
      return new Response(
        JSON.stringify({ error: 'Domain parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Fetching promo codes for domain: ${domain}, user: ${user.id}`);

    // Get influencers that this user follows who have promo codes for this domain
    const { data: userDomainMaps, error: domainError } = await supabaseClient
      .from('user_domain_map')
      .select('influencer_id')
      .eq('user_id', user.id)
      .eq('domain', domain);

    if (domainError) {
      console.error('Error fetching user domain mappings:', domainError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch domain mappings' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!userDomainMaps || userDomainMaps.length === 0) {
      console.log(`No domain mappings found for user ${user.id} and domain ${domain}`);
      return new Response(
        JSON.stringify({ promoCodes: [] }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const influencerIds = userDomainMaps.map(mapping => mapping.influencer_id);
    console.log(`Found ${influencerIds.length} influencers for domain ${domain}:`, influencerIds);

    // Get promo codes from these influencers where the brand_url matches the domain
    // We'll use a more complex query to extract domain and match
    const { data: promoCodes, error: promoError } = await supabaseClient
      .from('promo_codes')
      .select(`
        id,
        influencer_id,
        brand_name,
        brand_url,
        brand_instagram_handle,
        promo_code,
        description,
        expiration_date,
        affiliate_link,
        category,
        created_at,
        updated_at,
        agency_id,
        profiles:influencer_id (
          id,
          username,
          full_name,
          avatar_url,
          is_influencer
        )
      `)
      .in('influencer_id', influencerIds)
      .gte('expiration_date', new Date().toISOString().split('T')[0]) // Only non-expired codes
      .order('created_at', { ascending: false });

    if (promoError) {
      console.error('Error fetching promo codes:', promoError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch promo codes' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Filter promo codes by domain using the extract_domain function
    const filteredPromoCodes = [];
    
    for (const promoCode of promoCodes || []) {
      // Call the extract_domain function to get the domain from brand_url
      const { data: extractedDomain, error: extractError } = await supabaseClient
        .rpc('extract_domain', { url: promoCode.brand_url });

      if (extractError) {
        console.error('Error extracting domain:', extractError);
        continue;
      }

      // Check if the extracted domain matches our target domain
      if (extractedDomain === domain) {
        filteredPromoCodes.push(promoCode);
      }
    }

    console.log(`Found ${filteredPromoCodes.length} matching promo codes for domain ${domain}`);

    return new Response(
      JSON.stringify({ 
        promoCodes: filteredPromoCodes,
        domain: domain,
        userFollowsCount: influencerIds.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});