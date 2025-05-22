
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Set up CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[META-CONVERSION-API] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    logStep("Function started");

    const requestData = await req.json();
    const { eventName, eventData } = requestData;
    
    if (!eventName) {
      throw new Error("Event name must be specified");
    }

    logStep("Event received", { eventName, eventData });

    // Get Meta configuration
    const pixelId = Deno.env.get("META_PIXEL_ID") || "1210607367458076";
    const accessToken = Deno.env.get("META_API_ACCESS_TOKEN");
    
    if (!accessToken) {
      throw new Error("META_API_ACCESS_TOKEN is not set");
    }

    // Get user information from auth header if available
    const authHeader = req.headers.get("Authorization");
    let userData = {};
    
    if (authHeader) {
      // Process auth header to get user data if needed
      logStep("Authorization header present");
    }

    // Prepare data for Meta Conversion API
    const eventTime = Math.floor(Date.now() / 1000);
    const eventId = crypto.randomUUID();
    
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId,
          event_source_url: eventData.sourceUrl || req.headers.get("Referer"),
          user_data: {
            client_ip_address: req.headers.get("x-forwarded-for") || undefined,
            client_user_agent: req.headers.get("user-agent") || undefined,
            ...eventData.userData
          },
          custom_data: eventData.customData || {}
        }
      ]
    };
    
    logStep("Prepared payload for Meta API", { payloadSummary: {
      eventName, 
      eventId,
      eventTime,
      hasUserData: !!payload.data[0].user_data,
      hasCustomData: !!payload.data[0].custom_data
    }});

    // Send to Meta Conversion API
    const metaApiUrl = `https://graph.facebook.com/v16.0/${pixelId}/events`;
    const response = await fetch(metaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        access_token: accessToken
      })
    });
    
    const responseData = await response.json();
    logStep("Meta API response", responseData);
    
    if (!response.ok) {
      throw new Error(`Meta API responded with status ${response.status}: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      meta_response: responseData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[META-CONVERSION-API] ERROR: ${errorMessage}`);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
