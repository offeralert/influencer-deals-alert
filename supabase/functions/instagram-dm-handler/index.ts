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
        console.log("✅ Webhook verified successfully");
        return new Response(challenge, {
          status: 200,
          headers: corsHeaders,
        });
      } else {
        console.log("❌ Webhook verification failed - mode:", mode, "token:", token);
        return new Response("Forbidden", {
          status: 403,
          headers: corsHeaders,
        });
      }
    }

    // Handle incoming messages (POST request)
    if (req.method === "POST") {
      const body: InstagramWebhookData = await req.json();
      console.log("=== 🔔 WEBHOOK RECEIVED ===");
      console.log("📦 Full webhook payload:", JSON.stringify(body, null, 2));

      // Process each entry in the webhook
      for (const entry of body.entry) {
        console.log(`📋 Processing entry ID: ${entry.id} at time: ${entry.time}`);
        
        if (entry.messaging) {
          console.log(`💬 Found ${entry.messaging.length} messaging event(s)`);
          
          for (const messagingEvent of entry.messaging) {
            console.log(`=== 📨 PROCESSING MESSAGE EVENT ===`);
            console.log(`👤 Sender: ${messagingEvent.sender.id}`);
            console.log(`🎯 Recipient: ${messagingEvent.recipient.id}`);
            console.log(`⏰ Timestamp: ${messagingEvent.timestamp}`);
            
              if (messagingEvent.message) {
                const senderId = messagingEvent.sender.id;
                let processedMessage = false;

                console.log(`=== 📄 MESSAGE DETAILS ===`);
                console.log(`🆔 Message ID: ${messagingEvent.message.mid}`);
                console.log(`📝 Has text: ${!!messagingEvent.message.text}`);
                console.log(`📎 Has attachments: ${!!messagingEvent.message.attachments}`);
                console.log(`🔗 Has quick_reply: ${!!messagingEvent.message.quick_reply}`);
                console.log(`📋 Has template: ${!!messagingEvent.message.template}`);
                console.log(`🔍 Full message object:`, JSON.stringify(messagingEvent.message, null, 2));

                // Process text messages for Instagram handles and URLs
                if (messagingEvent.message.text) {
                  const messageText = messagingEvent.message.text;
                  console.log(`=== 📝 TEXT MESSAGE PROCESSING ===`);
                  console.log(`💬 Text content: "${messageText}"`);

                  // First try to extract username from Instagram URLs in text
                  const instagramUrl = messageText.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
                  if (instagramUrl) {
                    let username = instagramUrl[1];
                    if (!username.startsWith('@')) {
                      username = '@' + username;
                    }
                    console.log(`✅ Found Instagram URL in text, extracted username: ${username}`);
                    await processPromoCodeRequest(senderId, username, supabaseClient);
                    processedMessage = true;
                  } else {
                    // Check for deep links in text
                    const deepLinkUsername = extractUsernameFromDeepLink(messageText);
                    if (deepLinkUsername) {
                      console.log(`✅ Found Instagram username from deep link in text: ${deepLinkUsername}`);
                      await processPromoCodeRequest(senderId, deepLinkUsername, supabaseClient);
                      processedMessage = true;
                    } else {
                      // Extract Instagram handles from the message using regex
                      const instagramHandleRegex = /@([a-zA-Z0-9._]+)/g;
                      const matches = messageText.match(instagramHandleRegex);

                      if (matches && matches.length > 0) {
                        console.log(`✅ Found ${matches.length} Instagram handle(s):`, matches);
                        for (const handle of matches) {
                          console.log(`🔄 Processing handle: ${handle}`);
                          await processPromoCodeRequest(senderId, handle, supabaseClient);
                          processedMessage = true;
                        }
                      } else {
                        console.log("❌ No Instagram handles, URLs, or deep links found in text message");
                      }
                    }
                  }
                }

              // Process shared Instagram profile URLs and Android-specific formats
              if (messagingEvent.message.attachments) {
                console.log(`=== 📎 ATTACHMENTS PROCESSING ===`);
                console.log(`📊 Found ${messagingEvent.message.attachments.length} attachment(s)`);
                
                for (let i = 0; i < messagingEvent.message.attachments.length; i++) {
                  const attachment = messagingEvent.message.attachments[i];
                  console.log(`--- 📎 Attachment ${i + 1} ---`);
                  console.log(`🏷️ Type: ${attachment.type}`);
                  console.log(`🔍 Full attachment object:`, JSON.stringify(attachment, null, 2));
                  
                  if (attachment.type === "share" && attachment.payload) {
                    // Handle standard URL sharing
                    if (attachment.payload.url && attachment.payload.template_type !== "media") {
                      console.log("✅ Processing text-based share attachment...");
                      const brandUsername = extractInstagramUsername(attachment.payload.url);
                      if (brandUsername) {
                        console.log(`🎉 Successfully extracted brand username: ${brandUsername}`);
                        await processPromoCodeRequest(senderId, brandUsername, supabaseClient);
                        processedMessage = true;
                        continue;
                      }

                      // Check for deep links in shared URL
                      const deepLinkUsername = extractUsernameFromDeepLink(attachment.payload.url);
                      if (deepLinkUsername) {
                        console.log(`🎉 Successfully extracted username from deep link: ${deepLinkUsername}`);
                        await processPromoCodeRequest(senderId, deepLinkUsername, supabaseClient);
                        processedMessage = true;
                        continue;
                      }
                    }

                    // Handle structured objects and PODs (Android-specific)
                    const structuredUsername = extractUsernameFromStructuredData(attachment.payload);
                    if (structuredUsername) {
                      console.log(`🎉 Successfully extracted username from structured data: ${structuredUsername}`);
                      await processPromoCodeRequest(senderId, structuredUsername, supabaseClient);
                      processedMessage = true;
                      continue;
                    }

                    // If nothing worked, log for debugging
                    if (attachment.payload?.template_type === "media") {
                      console.log("🎥 Processing media share - attempting oEmbed extraction...");
                      const oembed = await processSharedMediaWithOEmbed(attachment.payload.url);
                      if (oembed) {
                        console.log(`🎉 Successfully extracted brand handle from oEmbed: ${oembed}`);
                        await processPromoCodeRequest(senderId, oembed, supabaseClient);
                        processedMessage = true;
                        continue;
                      }
                    }
                    
                    console.log("❌ Could not extract username from share attachment");
                    console.log("📊 Attachment payload summary:");
                    console.log("- Type:", attachment.type);
                    console.log("- Has URL:", !!attachment.payload?.url);
                    console.log("- Template type:", attachment.payload?.template_type);
                    console.log("- Keys in payload:", attachment.payload ? Object.keys(attachment.payload) : 'none');
                    
                    // Enhanced Android debugging
                    console.log("🤖 ANDROID DEBUGGING - Full attachment structure:");
                    console.log("- attachment.type:", attachment.type);
                    if (attachment.payload) {
                      console.log("- payload keys:", Object.keys(attachment.payload));
                      console.log("- payload.url:", attachment.payload.url);
                      console.log("- payload.title:", attachment.payload.title);
                      console.log("- payload.description:", attachment.payload.description);
                      console.log("- payload.template_type:", attachment.payload.template_type);
                      
                      // Check for any field that might contain Instagram reference
                      Object.keys(attachment.payload).forEach(key => {
                        const value = attachment.payload[key];
                        if (typeof value === 'string' && value.includes('instagram')) {
                          console.log(`- Found 'instagram' in ${key}:`, value);
                        }
                      });
                    }
                  } else {
                    console.log(`⚠️ Not a share attachment (type: ${attachment.type}) - skipping`);
                  }
                }
              }

              // Handle quick replies and generic templates (Android-specific)
              if (messagingEvent.message.quick_reply) {
                console.log(`=== 🔗 QUICK REPLY PROCESSING ===`);
                console.log(`🔍 Quick reply data:`, JSON.stringify(messagingEvent.message.quick_reply, null, 2));
                const quickReplyUsername = extractUsernameFromQuickReply(messagingEvent.message.quick_reply);
                if (quickReplyUsername) {
                  console.log(`🎉 Successfully extracted username from quick reply: ${quickReplyUsername}`);
                  await processPromoCodeRequest(senderId, quickReplyUsername, supabaseClient);
                  processedMessage = true;
                }
              }

              // Handle generic template messages
              if (messagingEvent.message.template) {
                console.log(`=== 📋 TEMPLATE PROCESSING ===`);
                console.log(`🔍 Template data:`, JSON.stringify(messagingEvent.message.template, null, 2));
                const templateUsername = extractUsernameFromTemplate(messagingEvent.message.template);
                if (templateUsername) {
                  console.log(`🎉 Successfully extracted username from template: ${templateUsername}`);
                  await processPromoCodeRequest(senderId, templateUsername, supabaseClient);
                  processedMessage = true;
                }
              }

              // Fallback: Check entire message object for any Instagram profile data
              if (!processedMessage) {
                console.log(`=== 🔄 FALLBACK PROCESSING ===`);
                const fallbackUsername = extractUsernameFromMessageFallback(messagingEvent.message);
                if (fallbackUsername) {
                  console.log(`🎉 Successfully extracted username from message fallback: ${fallbackUsername}`);
                  await processPromoCodeRequest(senderId, fallbackUsername, supabaseClient);
                  processedMessage = true;
                }
              }

              // Don't send any message if no valid content was processed
              if (!processedMessage) {
                console.log(`=== ❌ NO VALID CONTENT FOUND ===`);
                console.log("🚫 No Instagram handles found in text and no valid shared posts processed");
                console.log("🤐 No message will be sent - staying silent");
              } else {
                console.log(`✅ Message processed successfully - promo details should have been sent`);
              }
            } else {
              console.log("❌ No message object found in messaging event");
            }
          }
        } else {
          console.log("❌ No messaging events found in entry");
        }
      }

      console.log("=== ✅ WEBHOOK PROCESSING COMPLETE ===");
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
    console.error("=== ❌ ERROR PROCESSING WEBHOOK ===");
    console.error("💥 Error details:", error);
    console.error("📚 Error stack:", error.stack);
    return new Response("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function processSharedMediaWithOEmbed(sharedUrl: string, senderId: string): Promise<string | null> {
  console.log(`=== 🔄 PROCESSING SHARED MEDIA WITH OEMBED ===`);
  
  const accessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
  
  // Enhanced token validation
  if (!accessToken) {
    console.error("❌ Instagram access token not configured");
    await sendInstagramMessage(senderId, "error_token_missing", []);
    return null;
  }

  console.log("✅ Access token is configured");
  console.log(`🔗 Shared URL from payload: ${sharedUrl}`);
  
  // Enhanced token format validation
  console.log(`🔑 Token format check: starts with 'EAA': ${accessToken.startsWith('EAA')}`);
  console.log(`🔑 Token length: ${accessToken.length} characters`);

  try {
    // Enhanced token validation
    if (!accessToken.startsWith('EAA') || accessToken.length < 100) {
      console.error("❌ Access token appears to be in wrong format");
      console.error(`🔍 Token starts with: ${accessToken.substring(0, 10)}...`);
      await sendInstagramMessage(senderId, "error_token_invalid", []);
      return null;
    }

    // Extract clean Instagram URL from the shared URL
    const instagramUrl = extractInstagramUrl(sharedUrl);
    
    if (!instagramUrl) {
      console.log("❌ Could not extract valid Instagram URL from shared content");
      console.log(`🔍 Original URL: ${sharedUrl}`);
      await sendInstagramMessage(senderId, "error_url_extraction", []);
      return null;
    }

    console.log(`✅ Extracted Instagram URL: ${instagramUrl}`);

    // Test with the exact URL format from your example
    // Use the newer v21.0 API endpoint which is more stable
    const oembedUrl = `https://graph.facebook.com/v21.0/instagram_oembed?url=${encodeURIComponent(instagramUrl)}&access_token=${accessToken}`;
    console.log(`🔗 Making oEmbed API call to: ${oembedUrl.replace(accessToken, '[REDACTED_TOKEN]')}`);
    
    // Enhanced API call with proper headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(oembedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OfferAlert/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📊 oEmbed API Response status: ${response.status}`);
    console.log(`📋 oEmbed API Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const oembedData: InstagramOEmbedResponse = await response.json();
      console.log("🎉 oEmbed API call successful!");
      console.log("📦 oEmbed data received:", JSON.stringify(oembedData, null, 2));

      if (oembedData.author_name) {
        let brandHandle = oembedData.author_name.toLowerCase().trim();
        // Remove any spaces or special characters
        brandHandle = brandHandle.replace(/[^a-z0-9_.]/g, '');
        if (!brandHandle.startsWith('@')) {
          brandHandle = '@' + brandHandle;
        }
        console.log(`✅ Successfully extracted brand handle: ${brandHandle}`);
        return brandHandle;
      } else {
        console.log("❌ No author_name found in oEmbed response");
        console.log("🔍 Available fields:", Object.keys(oembedData));
        await sendInstagramMessage(senderId, "error_no_author", []);
        return null;
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ oEmbed API call failed (${response.status}): ${errorText}`);
      console.log(`🔍 Failed URL: ${instagramUrl}`);
      console.log(`🔑 Token prefix: ${accessToken.substring(0, 20)}...`);
      
      // Enhanced error handling with specific error codes
      if (response.status === 400) {
        if (errorText.includes('Invalid media URL') || errorText.includes('URL not found')) {
          console.log("❌ Error: Invalid or not found media URL");
          await sendInstagramMessage(senderId, "error_media_not_found", []);
        } else if (errorText.includes('Unsupported URL')) {
          console.log("❌ Error: Unsupported URL format");
          await sendInstagramMessage(senderId, "error_unsupported_url", []);
        } else {
          console.log("❌ Error: Bad request - general");
          await sendInstagramMessage(senderId, "error_bad_request", []);
        }
      } else if (response.status === 401) {
        console.log("❌ Error: Unauthorized - token issue");
        await sendInstagramMessage(senderId, "error_unauthorized", []);
      } else if (response.status === 403) {
        console.log("❌ Error: Forbidden - private media or permissions");
        await sendInstagramMessage(senderId, "error_private_media", []);
      } else if (response.status === 404) {
        console.log("❌ Error: Media not found");
        await sendInstagramMessage(senderId, "error_media_not_found", []);
      } else if (response.status === 429) {
        console.log("❌ Error: Rate limit exceeded");
        await sendInstagramMessage(senderId, "error_rate_limit", []);
      } else {
        console.log("❌ Error: General processing error");
        await sendInstagramMessage(senderId, "error_processing", []);
      }
      return null;
    }

  } catch (error) {
    console.error("❌ Error processing shared media with oEmbed:", error);
    console.error("📚 Error stack:", error.stack);
    console.error("🏷️ Error name:", error.name);
    console.error("💬 Error message:", error.message);
    
    // Check if it's a timeout error
    if (error.name === 'AbortError') {
      console.error("⏰ Request timed out");
      await sendInstagramMessage(senderId, "error_timeout", []);
    } else {
      await sendInstagramMessage(senderId, "error_processing", []);
    }
    return null;
  }
}

function extractInstagramUrl(url: string): string | null {
  console.log(`=== 🔍 EXTRACTING INSTAGRAM URL ===`);
  console.log(`📥 Input URL: ${url}`);
  
  try {
    // Enhanced Instagram URL patterns to handle more formats
    const instagramPatterns = [
      // Standard post URLs with various formats
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([A-Za-z0-9_-]+)/i,
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/reel\/([A-Za-z0-9_-]+)/i,
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/tv\/([A-Za-z0-9_-]+)/i,
      // Handle URLs with additional parameters and tracking
      /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i,
      // Handle URLs that might be encoded
      /instagram%2Ecom%2F(?:p|reel|tv)%2F([A-Za-z0-9_-]+)/i,
    ];
    
    // First try to decode if URL is encoded
    let decodedUrl = url;
    try {
      decodedUrl = decodeURIComponent(url);
      console.log(`🔓 Decoded URL: ${decodedUrl}`);
    } catch (e) {
      console.log("⚠️ URL not encoded or failed to decode, using original");
    }
    
    // Try each pattern on both original and decoded URLs
    const urlsToTest = [decodedUrl, url];
    
    for (const testUrl of urlsToTest) {
      for (const pattern of instagramPatterns) {
        const match = testUrl.match(pattern);
        if (match) {
          const postId = match[1];
          const cleanUrl = `https://www.instagram.com/p/${postId}/`;
          console.log(`✅ Extracted clean Instagram URL: ${cleanUrl}`);
          console.log(`🆔 Post ID: ${postId}`);
          return cleanUrl;
        }
      }
    }
    
    // Check if it's already a clean Instagram URL
    if (decodedUrl.includes('instagram.com') && (decodedUrl.includes('/p/') || decodedUrl.includes('/reel/') || decodedUrl.includes('/tv/'))) {
      // Normalize the URL
      try {
        const urlObj = new URL(decodedUrl);
        if (urlObj.hostname === 'instagram.com' || urlObj.hostname === 'www.instagram.com') {
          const pathMatch = urlObj.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
          if (pathMatch) {
            const postId = pathMatch[2];
            const normalizedUrl = `https://www.instagram.com/p/${postId}/`;
            console.log(`✅ Normalized Instagram URL: ${normalizedUrl}`);
            return normalizedUrl;
          }
        }
      } catch (e) {
        console.log("⚠️ Failed to parse URL with URL constructor:", e.message);
      }
      
      console.log(`✅ Using URL as is: ${decodedUrl}`);
      return decodedUrl;
    }
    
    console.log("❌ No valid Instagram URL pattern found");
    console.log("🔍 URL analysis:");
    console.log("- Contains 'instagram.com':", decodedUrl.includes('instagram.com'));
    console.log("- Contains '/p/':", decodedUrl.includes('/p/'));
    console.log("- Contains '/reel/':", decodedUrl.includes('/reel/'));
    console.log("- Contains '/tv/':", decodedUrl.includes('/tv/'));
    return null;
    
  } catch (error) {
    console.error("❌ Error extracting Instagram URL:", error);
    return null;
  }
}

function extractInstagramUsername(url: string): string | null {
  console.log(`=== 🔍 EXTRACTING INSTAGRAM USERNAME ===`);
  console.log(`📥 Input URL: ${url}`);
  
  try {
    // First try to decode if URL is encoded
    let decodedUrl = url;
    try {
      decodedUrl = decodeURIComponent(url);
      console.log(`🔓 Decoded URL: ${decodedUrl}`);
    } catch (e) {
      console.log("⚠️ URL not encoded or failed to decode, using original");
    }
    
    // Instagram profile URL patterns
    const instagramProfilePatterns = [
      // Standard profile URLs: https://www.instagram.com/username or https://instagram.com/username
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)(?:\/.*)?/i,
      // Handle encoded URLs
      /instagram%2Ecom%2F([a-zA-Z0-9._]+)/i,
    ];
    
    // Try each pattern on both original and decoded URLs
    const urlsToTest = [decodedUrl, url];
    
    for (const testUrl of urlsToTest) {
      for (const pattern of instagramProfilePatterns) {
        const match = testUrl.match(pattern);
        if (match) {
          let username = match[1];
          
          // Clean up the username - remove any trailing parameters or paths
          username = username.split('?')[0].split('/')[0].split('#')[0];
          
          // Validate username format (alphanumeric, dots, underscores only)
          if (/^[a-zA-Z0-9._]+$/.test(username)) {
            // Add @ prefix if not present
            if (!username.startsWith('@')) {
              username = '@' + username;
            }
            console.log(`✅ Successfully extracted username: ${username}`);
            return username;
          }
        }
      }
    }
    
    // Try URL constructor approach for better parsing
    try {
      const urlObj = new URL(decodedUrl.startsWith('http') ? decodedUrl : 'https://' + decodedUrl);
      if (urlObj.hostname === 'instagram.com' || urlObj.hostname === 'www.instagram.com') {
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
        if (pathParts.length > 0) {
          let username = pathParts[0];
          
          // Skip if it's a known Instagram path that's not a username
          const skipPaths = ['p', 'reel', 'tv', 'stories', 'explore', 'accounts', 'direct'];
          if (!skipPaths.includes(username.toLowerCase())) {
            // Validate username format
            if (/^[a-zA-Z0-9._]+$/.test(username)) {
              if (!username.startsWith('@')) {
                username = '@' + username;
              }
              console.log(`✅ Successfully extracted username via URL constructor: ${username}`);
              return username;
            }
          }
        }
      }
    } catch (e) {
      console.log("⚠️ Failed to parse URL with URL constructor:", e.message);
    }
    
    console.log("❌ No valid Instagram username found in URL");
    console.log("🔍 URL analysis:");
    console.log("- Contains 'instagram.com':", decodedUrl.includes('instagram.com'));
    console.log("- Decoded URL:", decodedUrl);
    return null;
    
  } catch (error) {
    console.error("❌ Error extracting Instagram username:", error);
    return null;
  }
}

async function processPromoCodeRequest(senderId: string, requestedHandle: string, supabaseClient: any) {
  console.log(`Processing promo code request for handle: ${requestedHandle}`);
  
  // Query promo codes for this Instagram handle
  // Get promo codes matching the requested brand
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
      influencer_id,
      agency_id,
      profiles:influencer_id (
        full_name,
        username,
        is_agency,
        is_influencer
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

  // For each promo code, determine the correct influencer to show
  if (promoCodes && promoCodes.length > 0) {
    for (let i = 0; i < promoCodes.length; i++) {
      const code = promoCodes[i];
      
      // If this promo code has an agency_id, it was created by an agency
      // In this case, the influencer_id points to the actual influencer, so we use that
      if (code.agency_id) {
        console.log(`Promo code ${code.id} was created by agency (${code.agency_id}), using influencer_id: ${code.influencer_id}`);
        
        // The profiles relation already gives us the correct influencer data via influencer_id
        if (code.profiles) {
          code.actualInfluencer = {
            username: code.profiles.username,
            full_name: code.profiles.full_name
          };
          console.log(`Using influencer from profiles: ${code.profiles.username}`);
        }
      } else {
        // This is a regular influencer-created promo code
        if (code.profiles) {
          code.actualInfluencer = {
            username: code.profiles.username,
            full_name: code.profiles.full_name
          };
          console.log(`Using regular influencer: ${code.profiles.username}`);
        }
      }
    }
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

  if (requestedHandle === "error_token_missing") {
    messageText = "Sorry, I'm having configuration issues. Please try again later or contact support.";
  } else if (requestedHandle === "error_token_invalid") {
    messageText = "I'm having trouble with my authentication. Please try again later or contact support.";
  } else if (requestedHandle === "error_url_extraction") {
    messageText = "I couldn't extract a valid Instagram URL from what you shared. Please make sure you're sharing an Instagram post or reel, or send me a brand's handle directly (like @nike).";
  } else if (requestedHandle === "error_media_not_found") {
    messageText = "I couldn't access that post. It might be deleted, private, or from a restricted account. Try sharing a different post or send me a brand's Instagram handle directly!";
  } else if (requestedHandle === "error_private_media") {
    messageText = "That post appears to be private or restricted. Please share a post from a public account, or send me the brand's Instagram handle directly (like @nike).";
  } else if (requestedHandle === "error_unsupported_url") {
    messageText = "That URL format isn't supported. Please share an Instagram post or reel directly, or send me the brand's handle (like @nike).";
  } else if (requestedHandle === "error_bad_request") {
    messageText = "I had trouble processing that request. Please try sharing the post again, or send me the brand's Instagram handle directly (like @nike).";
  } else if (requestedHandle === "error_unauthorized") {
    messageText = "I'm having authentication issues. Please try again later or contact support.";
  } else if (requestedHandle === "error_rate_limit") {
    messageText = "I'm getting too many requests right now. Please wait a moment and try again.";
  } else if (requestedHandle === "error_no_author") {
    messageText = "I couldn't identify the brand from that post. Please try sharing a different post or send me the brand's handle directly (like @nike).";
  } else if (requestedHandle === "error_processing") {
    messageText = "I had trouble processing that shared post. Please try sharing the post again, or send me the brand's Instagram handle directly (like @nike).";
  } else if (requestedHandle === "error_database") {
    messageText = "I'm having trouble accessing my database right now. Please try again in a moment!";
  } else if (requestedHandle === "no_valid_content") {
    messageText = "Thank you for using OfferAlert! For online browsing notifications check out our extension https://chromewebstore.google.com/detail/offer-alert/bpbafccmoldgaecdefhjfmmandfgblfk\n\nPlease share an Instagram profile URL or send me a brand's handle (like @instacart) to find promo codes.";
  } else if (!requestedHandle) {
    // This shouldn't happen anymore but keeping as fallback
    messageText = "Thank you for using OfferAlert! For online browsing notifications check out our extension https://chromewebstore.google.com/detail/offer-alert/bpbafccmoldgaecdefhjfmmandfgblfk\n\nPlease share an Instagram profile URL or send me a brand's handle (like @instacart) to find promo codes.";
  } else if (promoCodes.length === 0) {
    messageText = `Sorry, I couldn't find any promo codes for ${requestedHandle} right now. Try sharing a profile from another brand or searching for a different handle! 🔍`;
  } else {
    // Format response with all available promo codes
    const brandName = promoCodes[0].brand_name;
    messageText = `🎉 Found ${promoCodes.length} promo code${promoCodes.length > 1 ? 's' : ''} for ${brandName} (${requestedHandle}):\n\n`;
    
    promoCodes.forEach((code, index) => {
      if (promoCodes.length > 1) {
        messageText += `${index + 1}.\n`;
      }
      messageText += `Code: ${code.promo_code}\n`;
      messageText += `Amount: ${code.description}\n`;
      messageText += `Link: ${code.affiliate_link}\n`;
      
      // Show the appropriate username - either the actual influencer for agency codes or the profile username
      if (code.actualInfluencer) {
        // Agency-created promo code, show the actual influencer
        messageText += `From: @${code.actualInfluencer.username}\n`;
      } else if (code.profiles && code.profiles.username) {
        // Regular influencer-created promo code
        messageText += `From: @${code.profiles.username}\n`;
      }
      
      if (code.expiration_date) {
        const expDate = new Date(code.expiration_date).toLocaleDateString();
        messageText += `Expires: ${expDate}\n`;
      }
      
      messageText += "\n";
    });

    // Trim message if it's too long (Instagram has a 1000 character limit)
    if (messageText.length > 950) {
      messageText = messageText.substring(0, 950) + "...";
    }
  }

  try {
    console.log(`📤 Sending message to ${recipientId}: ${messageText.substring(0, 100)}...`);
    
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
      console.error("❌ Failed to send Instagram message:", errorData);
    } else {
      const responseData = await response.json();
      console.log(`✅ Successfully sent message to ${recipientId}:`, responseData);
    }
  } catch (error) {
    console.error("❌ Error sending Instagram message:", error);
  }
}

// ==== ANDROID-SPECIFIC PARSING FUNCTIONS ====

function extractUsernameFromDeepLink(text: string): string | null {
  console.log(`=== 📱 EXTRACTING USERNAME FROM DEEP LINK ===`);
  console.log(`📥 Input text: ${text}`);
  
  try {
    // Instagram deep link patterns
    const deepLinkPatterns = [
      // instagram://user?username=brandname
      /instagram:\/\/user\?username=([a-zA-Z0-9._]+)/i,
      // instagram://media?user=brandname
      /instagram:\/\/media\?user=([a-zA-Z0-9._]+)/i,
      // instagram://profile/brandname
      /instagram:\/\/profile\/([a-zA-Z0-9._]+)/i,
      // Intent URLs: intent://user?username=brandname#Intent;...
      /intent:\/\/[^?]*\?username=([a-zA-Z0-9._]+)/i,
      // Intent URLs with user parameter
      /intent:\/\/[^?]*\?user=([a-zA-Z0-9._]+)/i,
      // Instagram app URLs
      /instagram:\/\/.*[?&]username=([a-zA-Z0-9._]+)/i,
      /instagram:\/\/.*[?&]user=([a-zA-Z0-9._]+)/i,
    ];
    
    for (const pattern of deepLinkPatterns) {
      const match = text.match(pattern);
      if (match) {
        let username = match[1];
        
        // Validate username format
        if (/^[a-zA-Z0-9._]+$/.test(username)) {
          if (!username.startsWith('@')) {
            username = '@' + username;
          }
          console.log(`✅ Successfully extracted username from deep link: ${username}`);
          return username;
        }
      }
    }
    
    console.log("❌ No valid Instagram username found in deep link");
    return null;
    
  } catch (error) {
    console.error("❌ Error extracting username from deep link:", error);
    return null;
  }
}

function extractUsernameFromStructuredData(payload: any): string | null {
  console.log(`=== 📊 EXTRACTING USERNAME FROM STRUCTURED DATA ===`);
  console.log(`📥 Payload:`, JSON.stringify(payload, null, 2));
  
  try {
    // Check various possible fields where username might be stored
    const possibleFields = [
      'username',
      'user',
      'handle',
      'account',
      'profile_username',
      'instagram_username',
      'brand_username',
      'user_id',
      'profile_id'
    ];
    
    // Check direct fields
    for (const field of possibleFields) {
      if (payload[field] && typeof payload[field] === 'string') {
        let username = payload[field];
        
        // Clean and validate username
        username = username.replace(/^@/, '').trim();
        if (/^[a-zA-Z0-9._]+$/.test(username)) {
          username = '@' + username;
          console.log(`✅ Found username in field '${field}': ${username}`);
          return username;
        }
      }
    }
    
    // Check nested objects
    if (payload.profile && typeof payload.profile === 'object') {
      for (const field of possibleFields) {
        if (payload.profile[field] && typeof payload.profile[field] === 'string') {
          let username = payload.profile[field];
          username = username.replace(/^@/, '').trim();
          if (/^[a-zA-Z0-9._]+$/.test(username)) {
            username = '@' + username;
            console.log(`✅ Found username in profile.${field}: ${username}`);
            return username;
          }
        }
      }
    }
    
    // Check for URLs in structured data
    if (payload.url && typeof payload.url === 'string') {
      const urlUsername = extractInstagramUsername(payload.url);
      if (urlUsername) {
        console.log(`✅ Found username in structured URL: ${urlUsername}`);
        return urlUsername;
      }
    }
    
    // Check for deep links in structured data
    const allStringValues = JSON.stringify(payload);
    const deepLinkUsername = extractUsernameFromDeepLink(allStringValues);
    if (deepLinkUsername) {
      console.log(`✅ Found username in structured deep link: ${deepLinkUsername}`);
      return deepLinkUsername;
    }
    
    console.log("❌ No valid Instagram username found in structured data");
    return null;
    
  } catch (error) {
    console.error("❌ Error extracting username from structured data:", error);
    return null;
  }
}

function extractUsernameFromQuickReply(quickReply: any): string | null {
  console.log(`=== ⚡ EXTRACTING USERNAME FROM QUICK REPLY ===`);
  console.log(`📥 Quick reply:`, JSON.stringify(quickReply, null, 2));
  
  try {
    // Check payload field
    if (quickReply.payload) {
      // Try to parse as JSON if it's a string
      let payload = quickReply.payload;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          // If not JSON, treat as string and check for username patterns
          const username = extractUsernameFromDeepLink(payload) || extractInstagramUsername(payload);
          if (username) {
            console.log(`✅ Found username in quick reply payload string: ${username}`);
            return username;
          }
        }
      }
      
      // If payload is now an object, extract username from structured data
      if (typeof payload === 'object') {
        const username = extractUsernameFromStructuredData(payload);
        if (username) {
          console.log(`✅ Found username in quick reply payload object: ${username}`);
          return username;
        }
      }
    }
    
    console.log("❌ No valid Instagram username found in quick reply");
    return null;
    
  } catch (error) {
    console.error("❌ Error extracting username from quick reply:", error);
    return null;
  }
}

function extractUsernameFromTemplate(template: any): string | null {
  console.log(`=== 📄 EXTRACTING USERNAME FROM TEMPLATE ===`);
  console.log(`📥 Template:`, JSON.stringify(template, null, 2));
  
  try {
    // Check for generic template with elements
    if (template.elements && Array.isArray(template.elements)) {
      for (const element of template.elements) {
        // Check buttons
        if (element.buttons && Array.isArray(element.buttons)) {
          for (const button of element.buttons) {
            if (button.url) {
              const username = extractInstagramUsername(button.url) || extractUsernameFromDeepLink(button.url);
              if (username) {
                console.log(`✅ Found username in template button URL: ${username}`);
                return username;
              }
            }
          }
        }
        
        // Check for structured data in element
        const username = extractUsernameFromStructuredData(element);
        if (username) {
          console.log(`✅ Found username in template element: ${username}`);
          return username;
        }
      }
    }
    
    // Check template-level structured data
    const username = extractUsernameFromStructuredData(template);
    if (username) {
      console.log(`✅ Found username in template data: ${username}`);
      return username;
    }
    
    console.log("❌ No valid Instagram username found in template");
    return null;
    
  } catch (error) {
    console.error("❌ Error extracting username from template:", error);
    return null;
  }
}

function extractUsernameFromMessageFallback(message: any): string | null {
  console.log(`=== 🔄 EXTRACTING USERNAME FROM MESSAGE FALLBACK ===`);
  console.log(`📥 Message:`, JSON.stringify(message, null, 2));
  
  try {
    // Convert entire message to string and search for patterns
    const messageString = JSON.stringify(message);
    
    // Check for Instagram URLs in the entire message object
    const urlPattern = /instagram\.com\/([a-zA-Z0-9._]+)/gi;
    const urlMatches = messageString.match(urlPattern);
    if (urlMatches) {
      for (const match of urlMatches) {
        const username = extractInstagramUsername(`https://${match}`);
        if (username) {
          console.log(`✅ Found username in message fallback URL: ${username}`);
          return username;
        }
      }
    }
    
    // Check for deep links in the entire message object
    const deepLinkUsername = extractUsernameFromDeepLink(messageString);
    if (deepLinkUsername) {
      console.log(`✅ Found username in message fallback deep link: ${deepLinkUsername}`);
      return deepLinkUsername;
    }
    
    // Check for @username patterns
    const handlePattern = /@([a-zA-Z0-9._]+)/g;
    const handleMatches = messageString.match(handlePattern);
    if (handleMatches) {
      for (const handle of handleMatches) {
        const username = handle.substring(1); // Remove @
        if (/^[a-zA-Z0-9._]+$/.test(username)) {
          console.log(`✅ Found username in message fallback handle: @${username}`);
          return '@' + username;
        }
      }
    }
    
    console.log("❌ No valid Instagram username found in message fallback");
    return null;
    
  } catch (error) {
    console.error("❌ Error extracting username from message fallback:", error);
    return null;
  }
}
