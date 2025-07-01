
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
      attachments?: Array<{
        type: string;
        payload: {
          url?: string;
          sticker_id?: number;
          template_type?: string;
        };
      }>;
    };
  }>;
}

interface InstagramWebhookData {
  object: string;
  entry: InstagramWebhookEntry[];
}

interface InstagramMediaData {
  owner?: {
    id: string;
    username: string;
  };
  caption?: string;
  permalink?: string;
  media_type?: string;
  timestamp?: string;
  id: string;
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
            if (messagingEvent.message) {
              const senderId = messagingEvent.sender.id;
              let processedMessage = false;

              // Process text messages (existing functionality)
              if (messagingEvent.message.text) {
                const messageText = messagingEvent.message.text;
                console.log(`Processing text message from ${senderId}: ${messageText}`);

                // Extract Instagram handles from the message using regex
                const instagramHandleRegex = /@([a-zA-Z0-9._]+)/g;
                const matches = messageText.match(instagramHandleRegex);

                if (matches && matches.length > 0) {
                  for (const handle of matches) {
                    console.log(`Found Instagram handle in text: ${handle}`);
                    await processPromoCodeRequest(senderId, handle, supabaseClient);
                    processedMessage = true;
                  }
                }
              }

              // Process shared posts/attachments (new functionality)
              if (messagingEvent.message.attachments) {
                console.log(`Processing ${messagingEvent.message.attachments.length} attachments`);
                
                for (const attachment of messagingEvent.message.attachments) {
                  console.log(`Processing attachment type: ${attachment.type}`);
                  
                  if (attachment.type === "share" || attachment.type === "media") {
                    const brandHandle = await processSharedMedia(attachment, senderId);
                    if (brandHandle) {
                      console.log(`Extracted brand handle from shared post: ${brandHandle}`);
                      await processPromoCodeRequest(senderId, brandHandle, supabaseClient);
                      processedMessage = true;
                    }
                  }
                }
              }

              // If no handles found in text or attachments, send help message
              if (!processedMessage) {
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

async function processSharedMedia(attachment: any, senderId: string): Promise<string | null> {
  const accessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  
  if (!accessToken) {
    console.error("Instagram access token not configured");
    return null;
  }

  try {
    // Extract media ID from attachment URL
    let mediaId = null;
    
    if (attachment.payload?.url) {
      // Try to extract media ID from Instagram URL
      const urlMatches = attachment.payload.url.match(/\/p\/([A-Za-z0-9_-]+)/);
      if (urlMatches) {
        mediaId = urlMatches[1];
      } else {
        // Try alternative URL patterns
        const altMatches = attachment.payload.url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
        if (altMatches) {
          mediaId = altMatches[1];
        }
      }
    }

    if (!mediaId) {
      console.log("Could not extract media ID from attachment:", JSON.stringify(attachment));
      return null;
    }

    console.log(`Extracted media ID: ${mediaId}`);

    // Call Instagram Graph API to get media information
    const apiUrl = `https://graph.facebook.com/v18.0/${mediaId}?fields=owner,caption,permalink,media_type,timestamp&access_token=${accessToken}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Instagram API error (${response.status}):`, errorText);
      
      // Handle specific error cases
      if (response.status === 400) {
        await sendInstagramMessage(senderId, "error_media_not_found", []);
      } else if (response.status === 403) {
        await sendInstagramMessage(senderId, "error_private_media", []);
      }
      
      return null;
    }

    const mediaData: InstagramMediaData = await response.json();
    console.log("Media data from Instagram API:", JSON.stringify(mediaData, null, 2));

    // Extract and normalize brand handle
    if (mediaData.owner?.username) {
      let brandHandle = mediaData.owner.username.toLowerCase().trim();
      
      // Ensure handle starts with @
      if (!brandHandle.startsWith('@')) {
        brandHandle = '@' + brandHandle;
      }
      
      return brandHandle;
    }

    console.log("No owner username found in media data");
    return null;

  } catch (error) {
    console.error("Error processing shared media:", error);
    await sendInstagramMessage(senderId, "error_processing", []);
    return null;
  }
}

async function processPromoCodeRequest(senderId: string, requestedHandle: string, supabaseClient: any) {
  console.log(`Processing promo code request for handle: ${requestedHandle}`);
  
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
    .ilike('brand_instagram_handle', requestedHandle)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Database error:", error);
    await sendInstagramMessage(senderId, "error_database", []);
    return;
  }

  // Send response with promo codes
  await sendInstagramMessage(senderId, requestedHandle, promoCodes || []);
}

async function sendInstagramMessage(recipientId: string, requestedHandle: string | null, promoCodes: any[]) {
  const accessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  
  if (!accessToken) {
    console.error("Instagram access token not configured");
    return;
  }

  let messageText = "";

  if (requestedHandle === "error_media_not_found") {
    messageText = "I couldn't access that post. It might be deleted, private, or from a restricted account. Try sharing a different post or send me a brand's Instagram handle directly!";
  } else if (requestedHandle === "error_private_media") {
    messageText = "That post appears to be private or restricted. Please share a post from a public account, or send me the brand's Instagram handle directly (like @nike).";
  } else if (requestedHandle === "error_processing") {
    messageText = "I had trouble processing that shared post. Please try sharing the post again, or send me the brand's Instagram handle directly (like @nike).";
  } else if (requestedHandle === "error_database") {
    messageText = "I'm having trouble accessing my database right now. Please try again in a moment!";
  } else if (!requestedHandle) {
    messageText = "👋 Hi! You can:\n\n• Share an Instagram post from a brand and I'll find promo codes\n• Send me an Instagram handle (like @nike) to search manually\n\nI'll help you find the best deals! 🎁";
  } else if (promoCodes.length === 0) {
    messageText = `Sorry, I couldn't find any promo codes for ${requestedHandle} right now. Try sharing a post from another brand or searching for a different handle! 🔍`;
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
