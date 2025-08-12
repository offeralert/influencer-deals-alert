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

// OpenAI configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIRequest {
  message: string
  instagramUserId: string
  context?: {
    brand?: string
    noPromoCodesFound?: boolean
    generalQuery?: boolean
  }
}

async function sendToOpenAI(messages: OpenAIMessage[]): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error('Missing OpenAI API key')
    return null
  }

  try {
    console.log('Sending messages to OpenAI:', messages)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 300, // Keep responses concise for Instagram DMs
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    console.log('OpenAI response:', data)
    
    return data.choices[0]?.message?.content || null
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    return null
  }
}

async function getPopularBrands(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('brand_name')
      .limit(10)

    if (error) {
      console.error('Error fetching popular brands:', error)
      return []
    }

    // Get unique brand names
    const brands = [...new Set(data?.map(item => item.brand_name) || [])]
    return brands.slice(0, 5) // Top 5 brands
  } catch (error) {
    console.error('Error in getPopularBrands:', error)
    return []
  }
}

async function getConversationHistory(instagramUserId: string): Promise<OpenAIMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chatbase_interactions')
      .select('message_text, chatbase_response')
      .eq('instagram_user_id', instagramUserId)
      .order('created_at', { ascending: false })
      .limit(5) // Last 5 interactions for context

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting conversation history:', error)
      return []
    }

    const history: OpenAIMessage[] = []
    data?.reverse().forEach(interaction => {
      history.push({ role: 'user', content: interaction.message_text })
      history.push({ role: 'assistant', content: interaction.chatbase_response })
    })

    return history
  } catch (error) {
    console.error('Error in getConversationHistory:', error)
    return []
  }
}

function createSystemPrompt(popularBrands: string[], context?: any): string {
  return `You are OfferAlert's AI assistant helping users find promo codes and deals through Instagram DMs.

ABOUT OFFERALERT:
- We help users find the best promo codes and deals from their favorite influencers
- Users can search by brand name or Instagram handle (@username)
- We have partnerships with top brands and influencers

YOUR ROLE:
- Help users find promo codes when none are available for their requested brand
- Suggest similar or alternative brands that might have deals
- Provide general help about how OfferAlert works
- Keep responses concise (under 200 characters for Instagram DMs)

POPULAR BRANDS WITH DEALS:
${popularBrands.length > 0 ? popularBrands.join(', ') : 'Various fashion, beauty, and lifestyle brands'}

RESPONSE STYLE:
- Be helpful and friendly
- Use emojis sparingly
- Suggest specific alternatives when possible
- Direct users to share Instagram profiles or brand names
- If they ask about a brand we don't have, suggest similar popular brands

CURRENT CONTEXT:
${context?.brand ? `User searched for: ${context.brand}` : ''}
${context?.noPromoCodesFound ? 'No promo codes found for this brand' : ''}
${context?.generalQuery ? 'This is a general question about OfferAlert' : ''}`
}

async function saveConversation(instagramUserId: string, messageText: string, aiResponse: string) {
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
        chatbase_response: aiResponse,
        response_type: 'openai'
      })

    if (interactionError) {
      console.error('Error saving interaction:', interactionError)
    }
  } catch (error) {
    console.error('Error in saveConversation:', error)
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, instagramUserId, context }: OpenAIRequest = await req.json()

    if (!message || !instagramUserId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, instagramUserId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing OpenAI request:', { message, instagramUserId, context })

    // Get popular brands and conversation history
    const [popularBrands, conversationHistory] = await Promise.all([
      getPopularBrands(),
      getConversationHistory(instagramUserId)
    ])

    // Create system prompt with current context
    const systemPrompt = createSystemPrompt(popularBrands, context)

    // Build messages array
    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    // Send to OpenAI
    const aiResponse = await sendToOpenAI(messages)

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get response from OpenAI',
          fallbackMessage: "I'm sorry, I'm having trouble processing your request right now. Please try asking about a specific brand or check back later."
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Save conversation
    await saveConversation(instagramUserId, message, aiResponse)

    return new Response(
      JSON.stringify({
        response: aiResponse,
        responseType: 'openai'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in openai-integration:', error)
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