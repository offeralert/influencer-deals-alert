
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface InstagramWebhookEntry {
  id: string;
  time: number;
  messaging?: Array<{
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: {
      mid: string;
      text?: string;
    };
  }>;
}

interface InstagramWebhookData {
  object: string;
  entry: InstagramWebhookEntry[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle webhook verification (GET request)
    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      // Verify the webhook token matches your configured token
      const verifyToken = Deno.env.get("INSTAGRAM_VERIFY_TOKEN") || "offer_alert_verify_token";

      if (mode === "subscribe" && token === verifyToken) {
        console.log("Webhook verified successfully");
        return new Response(challenge, {
          status: 200,
          headers: corsHeaders,
        });
      } else {
        console.log("Webhook verification failed");
        return new Response("Forbidden", {
          status: 403,
          headers: corsHeaders,
        });
      }
    }

    // Handle incoming messages (POST request)
    if (req.method === "POST") {
      const body: InstagramWebhookData = await req.json();
      console.log("Received webhook:", JSON.stringify(body, null, 2));

      // Process each entry in the webhook
      for (const entry of body.entry) {
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            if (messagingEvent.message && messagingEvent.message.text) {
              const messageText = messagingEvent.message.text;
              const senderId = messagingEvent.sender.id;

              console.log(`Processing message from ${senderId}: ${messageText}`);

              // Extract Instagram handles from the message using regex
              const instagramHandleRegex = /@([a-zA-Z0-9._]+)/g;
              const matches = messageText.match(instagramHandleRegex);

              if (matches && matches.length > 0) {
                for (const handle of matches) {
                  console.log(`Found Instagram handle: ${handle}`);
                  
                  // Query promo codes for this Instagram handle
                  const { data: promoCodes, error } = await supabaseClient
                    .from('promo_codes')
                    .select(`
                      id,
                      brand_name,
                      brand_instagram_handle,
                      promo_code,
                      description,
                      affiliate_link,
                      expiration_date,
                      category,
                      profiles:influencer_id (
                        full_name,
                        username
                      )
                    `)
                    .ilike('brand_instagram_handle', handle)
                    .order('created_at', { ascending: false });

                  if (error) {
                    console.error("Database error:", error);
                    continue;
                  }

                  // Send response with promo codes
                  await sendInstagramMessage(senderId, handle, promoCodes || []);
                }
              } else {
                // No Instagram handles found, send help message
                await sendInstagramMessage(senderId, null, []);
              }
            }
          }
        }
      }

      return new Response("OK", {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function sendInstagramMessage(recipientId: string, requestedHandle: string | null, promoCodes: any[]) {
  const accessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  
  if (!accessToken) {
    console.error("Instagram access token not configured");
    return;
  }

  let messageText = "";

  if (!requestedHandle) {
    messageText = "👋 Hi! Send me an Instagram handle (like @nike) and I'll find available promo codes for you!";
  } else if (promoCodes.length === 0) {
    messageText = `Sorry, I couldn't find any promo codes for ${requestedHandle} right now. Try another brand!`;
  } else {
    // Format response with all available promo codes
    const brandName = promoCodes[0].brand_name;
    messageText = `🎉 Found ${promoCodes.length} promo code${promoCodes.length > 1 ? 's' : ''} for ${brandName} (${requestedHandle}):\n\n`;
    
    promoCodes.forEach((code, index) => {
      messageText += `${index + 1}. Code: ${code.promo_code}\n`;
      messageText += `   ${code.description}\n`;
      messageText += `   Link: ${code.affiliate_link}\n`;
      
      if (code.expiration_date) {
        const expDate = new Date(code.expiration_date).toLocaleDateString();
        messageText += `   Expires: ${expDate}\n`;
      }
      
      if (code.profiles && code.profiles.full_name) {
        messageText += `   By: ${code.profiles.full_name}\n`;
      }
      
      messageText += "\n";
    });

    // Trim message if it's too long (Instagram has a 1000 character limit)
    if (messageText.length > 950) {
      messageText = messageText.substring(0, 950) + "...";
    }
  }

  try {
    // Send message via Instagram Graph API
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messageText },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to send Instagram message:", errorData);
    } else {
      console.log(`Successfully sent message to ${recipientId}`);
    }
  } catch (error) {
    console.error("Error sending Instagram message:", error);
  }
}
