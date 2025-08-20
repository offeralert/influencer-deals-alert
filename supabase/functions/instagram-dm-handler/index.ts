
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Instagram configuration
const INSTAGRAM_ACCESS_TOKEN = Deno.env.get('INSTAGRAM_ACCESS_TOKEN')
const VERIFY_TOKEN = 'your_verify_token_here'

// Token validation function
const validateToken = (token: string | undefined): boolean => {
  console.log('🔍 DEBUG: validateToken called')
  console.log('🔍 DEBUG: token type:', typeof token)
  console.log('🔍 DEBUG: token is undefined:', token === undefined)
  console.log('🔍 DEBUG: token is null:', token === null)
  console.log('🔍 DEBUG: token is empty string:', token === '')
  
  if (!token) {
    console.error('❌ INSTAGRAM_ACCESS_TOKEN is missing or empty')
    return false
  }
  
  // Log token info for debugging (without exposing the actual token)
  console.log(`✅ Token found - Length: ${token.length}, Starts with: ${token.substring(0, 4)}...`)
  
  // Check minimum length
  if (token.length < 10) {
    console.error('❌ INSTAGRAM_ACCESS_TOKEN appears to be too short')
    return false
  }
  
  console.log('✅ Token validation passed - ready to send message')
  return true
}

// Instagram webhook handler
const handleWebhookVerification = (url: URL) => {
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified')
      return new Response(challenge, {
        status: 200,
        headers: corsHeaders
      })
    } else {
      return new Response('Forbidden', {
        status: 403,
        headers: corsHeaders
      })
    }
  }
  
  return null
}

const sendInstagramMessage = async (recipientId: string, message: string) => {
  if (!validateToken(INSTAGRAM_ACCESS_TOKEN)) {
    console.error('❌ Token validation failed - cannot send message')
    return
  }

  const url = `https://graph.facebook.com/v21.0/me/messages`
  const payload = {
    recipient: { id: recipientId },
    message: { text: message }
  }

  console.log(`📤 Sending message to ${recipientId}: ${message.substring(0, 80)}${message.length > 80 ? '...' : ''}`)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INSTAGRAM_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Instagram API error:', response.status, errorText)
      
      // Enhanced error reporting for token issues
      if (response.status === 400 || response.status === 401) {
        console.error('❌ This looks like a token authentication issue. Please check INSTAGRAM_ACCESS_TOKEN.')
      }
      return
    }

    const result = await response.json()
    console.log(`✅ Successfully sent message to ${recipientId}:`, result)
    return result
  } catch (error) {
    console.error('❌ Error sending Instagram message:', error)
  }
}

const callOpenAISmartAssistant = async (message: string, instagramUserId: string, imageUrl?: string) => {
  try {
    console.log(`🤖 Calling OpenAI Smart Assistant:`, { message, instagramUserId, imageUrl })
    
    const response = await supabase.functions.invoke('openai-integration', {
      body: { 
        message, 
        instagramUserId,
        imageUrl: imageUrl || null
      }
    })

    if (response.error) {
      console.error('❌ Error calling OpenAI Smart Assistant:', response.error)
      return null
    }

    console.log(`✅ OpenAI Smart Assistant response:`, response.data)
    return response.data
  } catch (error) {
    console.error('❌ Exception in callOpenAISmartAssistant:', error)
    return null
  }
}

// Extract asset_id from Instagram CDN URL
const extractAssetIdFromUrl = (url: string): string | null => {
  try {
    console.log(`🔍 Extracting asset_id from URL: ${url}`)
    const match = url.match(/asset_id=(\d+)/)
    if (match && match[1]) {
      console.log(`✅ Found asset_id: ${match[1]}`)
      return match[1]
    }
    console.log('❌ No asset_id found in URL')
    return null
  } catch (error) {
    console.error('❌ Error extracting asset_id:', error)
    return null
  }
}

// Get brand username from asset_id via two-step Graph API resolution
const getBrandFromAssetId = async (assetId: string): Promise<string | null> => {
  if (!validateToken(INSTAGRAM_ACCESS_TOKEN)) {
    console.error('❌ Token validation failed - cannot query Graph API')
    return null
  }

  try {
    console.log(`🔍 Step 1: Getting owner ID for asset_id: ${assetId}`)
    
    // Step 1: Get owner ID from asset_id
    const ownerResponse = await fetch(
      `https://graph.facebook.com/v21.0/${assetId}?fields=owner&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    )
    
    if (!ownerResponse.ok) {
      const errorText = await ownerResponse.text()
      console.error('❌ Graph API error (step 1):', ownerResponse.status, errorText)
      return null
    }
    
    const ownerData = await ownerResponse.json()
    console.log('✅ Step 1 response:', ownerData)
    
    if (!ownerData.owner || !ownerData.owner.id) {
      console.log('❌ No owner ID found in response')
      return null
    }
    
    const ownerId = ownerData.owner.id
    console.log(`🔍 Step 2: Getting username for owner ID: ${ownerId}`)
    
    // Step 2: Get username from owner ID
    const usernameResponse = await fetch(
      `https://graph.facebook.com/v21.0/${ownerId}?fields=username&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    )
    
    if (!usernameResponse.ok) {
      const errorText = await usernameResponse.text()
      console.error('❌ Graph API error (step 2):', usernameResponse.status, errorText)
      return null
    }
    
    const usernameData = await usernameResponse.json()
    console.log('✅ Step 2 response:', usernameData)
    
    if (!usernameData.username) {
      console.log('❌ No username found in response')
      return null
    }
    
    console.log(`✅ Resolved brand username: @${usernameData.username}`)
    return usernameData.username
    
  } catch (error) {
    console.error('❌ Error in getBrandFromAssetId:', error)
    return null
  }
}

// Process Instagram attachments for brand detection
const processAttachment = async (attachment: any, senderId: string): Promise<string | null> => {
  console.log('📎 Processing attachment:', JSON.stringify(attachment, null, 2))
  
  // Check if it's a share-type attachment (Instagram preview card)
  if (attachment.type === 'share' && attachment.payload && attachment.payload.url) {
    console.log('🔍 Detected Instagram share attachment')
    
    // Extract asset_id from the URL
    const assetId = extractAssetIdFromUrl(attachment.payload.url)
    if (!assetId) {
      console.log('❌ Could not extract asset_id from share URL')
      return null
    }
    
    // Get brand username from asset_id
    const brandUsername = await getBrandFromAssetId(assetId)
    if (brandUsername) {
      console.log(`✅ Successfully extracted brand: @${brandUsername}`)
      return `@${brandUsername}`
    } else {
      console.log('❌ Could not resolve brand username from asset_id')
      return null
    }
  }
  
  console.log(`📎 Attachment type "${attachment.type}" not supported for brand detection`)
  return null
}

const isBrandOrHandleMessage = (text: string): boolean => {
  // Check if message starts with @ or contains brand-like patterns
  if (text.startsWith('@')) return true
  
  // Check if it's likely a brand name (not a greeting or question)
  const greetings = ['hello', 'hi', 'hey', 'sup', 'what\'s up', 'good morning', 'good evening', 'good afternoon']
  const questions = ['how', 'what', 'when', 'where', 'why', 'can you', 'could you', 'help me']
  
  const lowerText = text.toLowerCase().trim()
  
  // If it's a greeting or question, not a brand search
  if (greetings.some(greeting => lowerText.includes(greeting)) || 
      questions.some(question => lowerText.startsWith(question))) {
    return false
  }
  
  // If it's a single word or short phrase without spaces (likely a brand)
  if (text.trim().split(' ').length <= 2 && text.length > 2) {
    return true
  }
  
  return false
}

const processInstagramMessage = async (senderId: string, messageText: string, attachments?: any[]) => {
  console.log(`🔍 Processing message: "${messageText}" from ${senderId}`)
  
  // Check if this looks like a brand/handle search
  const isBrandSearch = isBrandOrHandleMessage(messageText)
  
  if (isBrandSearch) {
    // Send immediate holding message for brand searches
    console.log(`🔍 Detected brand search, sending holding message...`)
    await sendInstagramMessage(senderId, "🔍 Searching for deals...")
    
    // Small delay to ensure holding message is sent first
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Process with OpenAI Smart Assistant
  console.log(`🎯 Sending to OpenAI Smart Assistant: "${messageText}"`)
  const aiResponse = await callOpenAISmartAssistant(messageText, senderId)
  
  if (aiResponse && aiResponse.response) {
    console.log(`🎯 Smart Assistant response: ${aiResponse.response}`)
    await sendInstagramMessage(senderId, aiResponse.response)
  } else {
    console.log(`❌ No valid response from Smart Assistant, sending fallback`)
    let fallbackMessage = "I'm sorry, I'm having trouble right now. Tell me a brand name or @handle and I'll find you the best deals! 🛍️"
    
    // If it was a brand search that failed, be more specific
    if (isBrandSearch) {
      fallbackMessage = `Sorry, I couldn't find any promo codes for ${messageText} right now. Try another brand name or @handle and I'll help you find deals! 💡`
    }
    
    await sendInstagramMessage(senderId, fallbackMessage)
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  
  // Handle webhook verification (GET request)
  if (req.method === 'GET') {
    const verificationResponse = handleWebhookVerification(url)
    if (verificationResponse) return verificationResponse
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('=== 🔔 WEBHOOK RECEIVED (v2.0) ===')
    console.log('📦 Full webhook payload:', JSON.stringify(body, null, 2))

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        console.log(`📋 Processing entry ID: ${entry.id} at time: ${entry.time}`)
        console.log(`🎯 Recipient: ${entry.id}`)
        
        if (entry.messaging) {
          console.log(`💬 Found ${entry.messaging.length} messaging event(s)`)
          
          for (const messagingEvent of entry.messaging) {
            console.log('=== 📨 PROCESSING MESSAGE EVENT ===')
            console.log(`👤 Sender: ${messagingEvent.sender.id}`)
            console.log(`⏰ Timestamp: ${messagingEvent.timestamp}`)
            
            // Skip if no message object (read receipts, etc.)
            if (!messagingEvent.message) {
              console.log('❌ No message object found in messaging event - likely a read receipt or other event type')
              continue
            }

            // Skip echo messages (bot's own responses)
            if (messagingEvent.message.is_echo) {
              console.log('🔄 Skipping echo message (bot\'s own response)')
              continue
            }

            console.log('=== 📄 MESSAGE DETAILS ===')
            console.log(`🆔 Message ID: ${messagingEvent.message.mid}`)
            console.log(`🔄 Is echo: ${messagingEvent.message.is_echo || false}`)
            console.log(`📝 Has text: ${!!messagingEvent.message.text}`)
            console.log(`📎 Has attachments: ${!!messagingEvent.message.attachments}`)
            console.log(`🔗 Has quick_reply: ${!!messagingEvent.message.quick_reply}`)
            console.log(`📋 Has template: ${!!messagingEvent.message.template}`)

            const messageText = messagingEvent.message.text
            const senderId = messagingEvent.sender.id
            const attachments = messagingEvent.message.attachments

            if (messageText) {
              console.log(`📝 Text message: "${messageText}"`)
              console.log(`🤖 Sending to OpenAI Smart Assistant: "${messageText}"`)
              
              // Process the message
              await processInstagramMessage(senderId, messageText, attachments)
            } else if (attachments && attachments.length > 0) {
              console.log('📎 Message contains only attachments - checking for brand detection')
              
              // Try to extract brand from attachments
              let detectedBrand: string | null = null
              for (const attachment of attachments) {
                detectedBrand = await processAttachment(attachment, senderId)
                if (detectedBrand) break // Use first successfully detected brand
              }
              
              if (detectedBrand) {
                console.log(`🎯 Brand detected from attachment: ${detectedBrand}`)
                // Process as brand search
                await processInstagramMessage(senderId, detectedBrand, attachments)
              } else {
                console.log('📎 No brand detected from attachments, sending fallback message')
                await sendInstagramMessage(senderId, "I can help you find promo codes! Send me a brand name or @handle and I'll find the best deals for you! 🛍️")
              }
            } else {
              console.log('❌ Message has no text or attachments')
              await sendInstagramMessage(senderId, "I can help you find promo codes! Send me a brand name or @handle and I'll find the best deals for you! 🛍️")
            }
          }
        }
      }
    }

    console.log('=== ✅ WEBHOOK PROCESSING COMPLETE ===')
    
    return new Response('OK', {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return new Response('Error processing webhook', {
      status: 500,
      headers: corsHeaders
    })
  }
})
