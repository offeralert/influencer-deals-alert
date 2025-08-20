
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
  if (!token) {
    console.error('❌ INSTAGRAM_ACCESS_TOKEN is missing')
    return false
  }
  
  // Check minimum length
  if (token.length < 10) {
    console.error('❌ INSTAGRAM_ACCESS_TOKEN appears to be too short')
    return false
  }
  
  // Log token info for debugging (without exposing the actual token)
  console.log(`✅ Token found - Length: ${token.length}, Starts with: ${token.substring(0, 4)}...`)
  
  // Instagram tokens can have various formats, so we'll be less strict
  // Just check it's not empty and has reasonable length
  console.log('✅ Token validation passed')
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
            } else {
              console.log('📎 Message contains only attachments or other non-text content')
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
