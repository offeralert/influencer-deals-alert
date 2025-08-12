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
  imageUrl?: string
  context?: {
    brand?: string
    noPromoCodesFound?: boolean
    generalQuery?: boolean
    alternativeBrands?: string[]
  }
}

interface OpenAIMessageWithVision {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{
    type: 'text' | 'image_url'
    text?: string
    image_url?: {
      url: string
    }
  }>
}

async function sendToOpenAI(messages: (OpenAIMessage | OpenAIMessageWithVision)[]): Promise<string | null> {
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
        model: 'gpt-4.1-2025-04-14',
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

async function extractUsernameFromImage(imageUrl: string): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error('Missing OpenAI API key for vision')
    return null
  }

  try {
    console.log('🖼️ Extracting username from Instagram preview image:', imageUrl)
    
    const visionMessage: OpenAIMessageWithVision = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'This is an Instagram preview card/story. Please extract the username from the top heading or profile name. Return ONLY the username without the @ symbol. If no username is visible, return "NOT_FOUND".'
        },
        {
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        }
      ]
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [visionMessage],
        max_tokens: 50,
        temperature: 0.1,
      })
    })

    if (!response.ok) {
      console.error('OpenAI Vision API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    const extractedText = data.choices[0]?.message?.content?.trim()
    
    console.log('🔍 Vision API extracted:', extractedText)
    
    if (extractedText && extractedText !== 'NOT_FOUND') {
      // Clean up the extracted username
      const cleanUsername = extractedText.replace(/[@\s]/g, '').toLowerCase()
      return cleanUsername
    }
    
    return null
  } catch (error) {
    console.error('Error in extractUsernameFromImage:', error)
    return null
  }
}

async function getPopularBrands(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('brand_name')
      .limit(50)

    if (error) {
      console.error('Error fetching popular brands:', error)
      return []
    }

    // Get unique brand names
    const brands = [...new Set(data?.map(item => item.brand_name) || [])]
    return brands.slice(0, 20) // Top 20 brands for better recommendations
  } catch (error) {
    console.error('Error in getPopularBrands:', error)
    return []
  }
}

async function getBrandsByCategory(requestedBrand: string): Promise<string[]> {
  try {
    console.log(`🔍 Finding similar brands for: ${requestedBrand}`)
    const { data, error } = await supabase
      .from('promo_codes')
      .select('brand_name, category')
      .ilike('brand_name', `%${requestedBrand}%`)
      .limit(20)

    if (error) {
      console.error('Error fetching similar brands:', error)
      return []
    }

    // If we found exact matches, return those
    if (data && data.length > 0) {
      return [...new Set(data.map(item => item.brand_name))]
    }

    // Otherwise, get brands from common categories
    const { data: categoryData, error: categoryError } = await supabase
      .from('promo_codes')
      .select('brand_name')
      .in('category', ['Fashion', 'Beauty', 'Tech', 'Food', 'Lifestyle'])
      .limit(15)

    if (categoryError) {
      console.error('Error fetching category brands:', categoryError)
      return []
    }

    const similarBrands = [...new Set(categoryData?.map(item => item.brand_name) || [])]
    console.log(`✅ Found ${similarBrands.length} alternative brands`)
    return similarBrands
  } catch (error) {
    console.error('Error in getBrandsByCategory:', error)
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

BRANDS AVAILABLE WITH PROMO CODES:
${popularBrands.length > 0 ? popularBrands.join(', ') : 'Various fashion, beauty, and lifestyle brands'}

${context?.alternativeBrands ? `ALTERNATIVE BRANDS FOR "${context.brand}": ${context.alternativeBrands.join(', ')}` : ''}

RESPONSE GUIDELINES:
- When no promo codes exist for a requested brand, suggest specific alternatives from our available brands
- Prioritize brands that actually have promo codes in our database
- Be helpful and friendly but concise
- Use format: "No codes for [brand] right now, but try: [alternatives]"
- For general questions, explain how to use OfferAlert

CURRENT CONTEXT:
${context?.brand ? `User searched for: ${context.brand}` : ''}
${context?.noPromoCodesFound ? 'No promo codes found for this brand - suggest alternatives' : ''}
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
    const { message, instagramUserId, imageUrl, context }: OpenAIRequest = await req.json()

    if (!message || !instagramUserId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, instagramUserId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing OpenAI request:', { message, instagramUserId, imageUrl, context })

    // Handle image processing for Instagram preview cards
    let extractedUsername = null
    if (imageUrl) {
      console.log('🖼️ Image URL provided, attempting to extract username')
      extractedUsername = await extractUsernameFromImage(imageUrl)
      if (extractedUsername) {
        console.log(`✅ Extracted username from image: ${extractedUsername}`)
        return new Response(
          JSON.stringify({
            response: `Found username: ${extractedUsername}`,
            responseType: 'username_extraction',
            extractedUsername: extractedUsername
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Get alternative brands if this is a "no promo codes found" request
    let alternativeBrands: string[] = []
    if (context?.noPromoCodesFound && context?.brand) {
      alternativeBrands = await getBrandsByCategory(context.brand)
      console.log(`🔍 Found ${alternativeBrands.length} alternative brands for ${context.brand}`)
    }

    // Get popular brands and conversation history
    const [popularBrands, conversationHistory] = await Promise.all([
      getPopularBrands(),
      getConversationHistory(instagramUserId)
    ])

    // Create system prompt with current context including alternative brands
    const enhancedContext = {
      ...context,
      alternativeBrands
    }
    const systemPrompt = createSystemPrompt(popularBrands, enhancedContext)

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