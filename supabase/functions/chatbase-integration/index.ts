import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Chatbase configuration
const CHATBASE_API_KEY = Deno.env.get('CHATBASE_API_KEY')
const CHATBASE_CHATBOT_ID = Deno.env.get('CHATBASE_CHATBOT_ID')

interface ChatbaseMessage {
  message: string
  chatId: string
  stream?: boolean
}

interface ChatbaseResponse {
  text: string
  sourceDocuments?: any[]
}

async function sendToChatbase(message: string, chatId: string): Promise<ChatbaseResponse | null> {
  if (!CHATBASE_API_KEY || !CHATBASE_CHATBOT_ID) {
    console.error('Missing Chatbase configuration')
    return null
  }

  try {
    console.log('Sending message to Chatbase:', { message, chatId })
    
    const response = await fetch(`https://www.chatbase.co/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHATBASE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        chatbotId: CHATBASE_CHATBOT_ID,
        chatId,
        stream: false
      })
    })

    if (!response.ok) {
      console.error('Chatbase API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    console.log('Chatbase response:', data)
    
    return data
  } catch (error) {
    console.error('Error calling Chatbase:', error)
    return null
  }
}

async function saveConversation(instagramUserId: string, messageText: string, chatbaseResponse: string, responseType: string) {
  try {
    // Update or create conversation record
    const { error: conversationError } = await supabase
      .from('user_conversations')
      .upsert({
        instagram_user_id: instagramUserId,
        last_interaction_at: new Date().toISOString(),
        conversation_context: { last_message: messageText }
      }, {
        onConflict: 'instagram_user_id'
      })

    if (conversationError) {
      console.error('Error saving conversation:', conversationError)
    }

    // Log the interaction
    const { error: interactionError } = await supabase
      .from('chatbase_interactions')
      .insert({
        instagram_user_id: instagramUserId,
        message_text: messageText,
        chatbase_response: chatbaseResponse,
        response_type: responseType
      })

    if (interactionError) {
      console.error('Error saving interaction:', interactionError)
    }
  } catch (error) {
    console.error('Error in saveConversation:', error)
  }
}

async function getConversationContext(instagramUserId: string) {
  try {
    const { data, error } = await supabase
      .from('user_conversations')
      .select('conversation_context')
      .eq('instagram_user_id', instagramUserId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error getting conversation context:', error)
      return {}
    }

    return data?.conversation_context || {}
  } catch (error) {
    console.error('Error in getConversationContext:', error)
    return {}
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, instagramUserId, context } = await req.json()

    if (!message || !instagramUserId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, instagramUserId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing Chatbase request:', { message, instagramUserId })

    // Get conversation context
    const conversationContext = await getConversationContext(instagramUserId)
    
    // Create enhanced message with context
    let enhancedMessage = message
    if (context?.brand && context?.noPromoCodesFound) {
      enhancedMessage = `User is asking about ${context.brand} but we don't have any promo codes for them. Original message: ${message}`
    } else if (context?.generalQuery) {
      enhancedMessage = `This is a general question about OfferAlert or promo codes: ${message}`
    }

    // Send to Chatbase
    const chatbaseResponse = await sendToChatbase(enhancedMessage, instagramUserId)

    if (!chatbaseResponse) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get response from Chatbase',
          fallbackMessage: "I'm sorry, I'm having trouble processing your request right now. Please try asking about a specific brand or check back later."
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Save conversation
    await saveConversation(
      instagramUserId, 
      message, 
      chatbaseResponse.text, 
      'chatbase'
    )

    return new Response(
      JSON.stringify({
        response: chatbaseResponse.text,
        sourceDocuments: chatbaseResponse.sourceDocuments || [],
        responseType: 'chatbase'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in chatbase-integration:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        fallbackMessage: "I'm sorry, something went wrong. Please try again or ask about a specific brand."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})