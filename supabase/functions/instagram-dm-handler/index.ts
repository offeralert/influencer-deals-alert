
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

interface InstagramOEmbedResponse {
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  title?: string;
  type?: string;
  version?: string;
  html?: string;
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
        console.log("Webhook verification failed - mode:", mode, "token:", token);
        return new Response("Forbidden", {
          status: 403,
          headers: corsHeaders,
        });
      }
    }

    // Handle incoming messages (POST request)
    if (req.method === "POST") {
      const body: InstagramWebhookData = await req.json();
      console.log("=== WEBHOOK RECEIVED ===");
      console.log("Full webhook payload:", JSON.stringify(body, null, 2));

      // Process each entry in the webhook
      for (const entry of body.entry) {
        console.log(`Processing entry ID: ${entry.id} at time: ${entry.time}`);
        
        if (entry.messaging) {
          console.log(`Found ${entry.messaging.length} messaging event(s)`);
          
          for (const messagingEvent of entry.messaging) {
            console.log(`=== PROCESSING MESSAGE EVENT ===`);
            console.log(`Sender: ${messagingEvent.sender.id}`);
            console.log(`Recipient: ${messagingEvent.recipient.id}`);
            console.log(`Timestamp: ${messagingEvent.timestamp}`);
            
            if (messagingEvent.message) {
              const senderId = messagingEvent.sender.id;
              let processedMessage = false;

              console.log(`=== MESSAGE DETAILS ===`);
              console.log(`Message ID: ${messagingEvent.message.mid}`);
              console.log(`Has text: ${!!messagingEvent.message.text}`);
              console.log(`Has attachments: ${!!messagingEvent.message.attachments}`);
              console.log(`Full message object:`, JSON.stringify(messagingEvent.message, null, 2));

              // Process text messages (existing functionality)
              if (messagingEvent.message.text) {
                const messageText = messagingEvent.message.text;
                console.log(`=== TEXT MESSAGE PROCESSING ===`);
                console.log(`Text content: "${messageText}"`);

                // Extract Instagram handles from the message using regex
                const instagramHandleRegex = /@([a-zA-Z0-9._]+)/g;
                const matches = messageText.match(instagramHandleRegex);

                if (matches && matches.length > 0) {
                  console.log(`Found ${matches.length} Instagram handle(s):`, matches);
                  for (const handle of matches) {
                    console.log(`Processing handle: ${handle}`);
                    await processPromoCodeRequest(senderId, handle, supabaseClient);
                    processedMessage = true;
                  }
                } else {
                  console.log("No Instagram handles found in text message");
                }
              }

              // Process shared posts/attachments using oEmbed API
              if (messagingEvent.message.attachments) {
                console.log(`=== ATTACHMENTS PROCESSING ===`);
                console.log(`Found ${messagingEvent.message.attachments.length} attachment(s)`);
                
                for (let i = 0; i < messagingEvent.message.attachments.length; i++) {
                  const attachment = messagingEvent.message.attachments[i];
                  console.log(`--- Attachment ${i + 1} ---`);
                  console.log(`Type: ${attachment.type}`);
                  console.log(`Full attachment object:`, JSON.stringify(attachment, null, 2));
                  
                  // Process shared Instagram posts
                  if (attachment.type === "share" && attachment.payload?.url) {
                    console.log("✓ This is a SHARE attachment - processing with oEmbed API...");
                    const brandHandle = await processSharedMediaWithOEmbed(attachment.payload.url, senderId);
                    if (brandHandle) {
                      console.log(`Successfully extracted brand handle: ${brandHandle}`);
                      await processPromoCodeRequest(senderId, brandHandle, supabaseClient);
                      processedMessage = true;
                    } else {
                      console.log("Failed to extract brand handle from shared media");
                    }
                  } else {
                    console.log(`✗ Not a share attachment or no URL (type: ${attachment.type}) - skipping`);
                  }
                }
              } else {
                console.log("No attachments found in message");
              }

              // If no handles found in text or attachments, send help message
              if (!processedMessage) {
                console.log(`=== NO VALID CONTENT FOUND ===`);
                console.log("No Instagram handles found in text and no valid shared posts processed");
                console.log("Sending help message to user");
                await sendInstagramMessage(senderId, null, []);
              } else {
                console.log(`✓ Message processed successfully`);
              }
            } else {
              console.log("No message object found in messaging event");
            }
          }
        } else {
          console.log("No messaging events found in entry");
        }
      }

      console.log("=== WEBHOOK PROCESSING COMPLETE ===");
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
    console.error("=== ERROR PROCESSING WEBHOOK ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function processSharedMediaWithOEmbed(sharedUrl: string, senderId: string): Promise<string | null> {
  console.log(`=== PROCESSING SHARED MEDIA WITH OEMBED ===`);
  
  const accessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  
  if (!accessToken) {
    console.error("❌ Instagram access token not configured");
    await sendInstagramMessage(senderId, "error_token_missing", []);
    return null;
  }

  console.log("✓ Access token is configured");
  console.log(`Shared URL from payload: ${sharedUrl}`);

  try {
    // Extract clean Instagram URL from the shared URL
    const instagramUrl = extractInstagramUrl(sharedUrl);
    
    if (!instagramUrl) {
      console.log("❌ Could not extract valid Instagram URL from shared content");
      await sendInstagramMessage(senderId, "error_processing", []);
      return null;
    }

    console.log(`✓ Extracted Instagram URL: ${instagramUrl}`);

    // Use Instagram oEmbed API to get post information
    const oembedUrl = `https://graph.facebook.com/v23.0/instagram_oembed?url=${encodeURIComponent(instagramUrl)}&access_token=${accessToken}`;
    console.log(`Making oEmbed API call: ${oembedUrl.replace(accessToken, '[REDACTED]')}`);
    
    const response = await fetch(oembedUrl);
    console.log(`oEmbed API Response status: ${response.status}`);
    
    if (response.ok) {
      const oembedData: InstagramOEmbedResponse = await response.json();
      console.log("✓ oEmbed API call successful!");
      console.log("oEmbed data received:", JSON.stringify(oembedData, null, 2));

      if (oembedData.author_name) {
        let brandHandle = oembedData.author_name.toLowerCase().trim();
        if (!brandHandle.startsWith('@')) {
          brandHandle = '@' + brandHandle;
        }
        console.log(`✓ Successfully extracted brand handle: ${brandHandle}`);
        return brandHandle;
      } else {
        console.log("❌ No author_name found in oEmbed response");
        await sendInstagramMessage(senderId, "error_processing", []);
        return null;
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ oEmbed API call failed (${response.status}): ${errorText}`);
      
      // Handle specific error cases
      if (response.status === 400) {
        console.log("Sending 'media not found' error message to user");
        await sendInstagramMessage(senderId, "error_media_not_found", []);
      } else if (response.status === 403) {
        console.log("Sending 'private media' error message to user");
        await sendInstagramMessage(senderId, "error_private_media", []);
      } else {
        await sendInstagramMessage(senderId, "error_processing", []);
      }
      return null;
    }

  } catch (error) {
    console.error("❌ Error processing shared media with oEmbed:", error);
    console.error("Error stack:", error.stack);
    await sendInstagramMessage(senderId, "error_processing", []);
    return null;
  }
}

function extractInstagramUrl(url: string): string | null {
  console.log(`=== EXTRACTING INSTAGRAM URL ===`);
  console.log(`Input URL: ${url}`);
  
  try {
    // Handle various Instagram URL formats
    const instagramPatterns = [
      // Standard post URLs
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
      // Handle URLs that might be encoded or have additional parameters
      /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/,
    ];
    
    for (const pattern of instagramPatterns) {
      const match = url.match(pattern);
      if (match) {
        const postId = match[1];
        const cleanUrl = `https://www.instagram.com/p/${postId}/`;
        console.log(`✓ Extracted clean Instagram URL: ${cleanUrl}`);
        return cleanUrl;
      }
    }
    
    // If it's already a clean Instagram URL, return as is
    if (url.includes('instagram.com') && (url.includes('/p/') || url.includes('/reel/'))) {
      console.log(`✓ URL is already a clean Instagram URL: ${url}`);
      return url;
    }
    
    console.log("❌ No valid Instagram URL pattern found");
    return null;
    
  } catch (error) {
    console.error("❌ Error extracting Instagram URL:", error);
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

  console.log(`Found ${promoCodes?.length || 0} promo codes for ${requestedHandle}`);

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

  if (requestedHandle === "error_token_missing") {
    messageText = "Sorry, I'm having configuration issues. Please try again later or contact support.";
  } else if (requestedHandle === "error_media_not_found") {
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
    console.log(`Sending message to ${recipientId}: ${messageText.substring(0, 100)}...`);
    
    // Send message via Instagram Graph API
    const response = await fetch(`https://graph.facebook.com/v23.0/me/messages`, {
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
      const responseData = await response.json();
      console.log(`Successfully sent message to ${recipientId}:`, responseData);
    }
  } catch (error) {
    console.error("Error sending Instagram message:", error);
  }
}
