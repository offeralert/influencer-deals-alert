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
  role: 'system' | 'user' | 'assistant' | 'function'
  content: string | null
  function_call?: {
    name: string
    arguments: string
  }
  name?: string
}

interface OpenAIMessageWithVision {
  role: 'user'
  content: Array<{
    type: 'text' | 'image_url'
    text?: string
    image_url?: {
      url: string
    }
  }>
}

interface OpenAIRequest {
  message: string
  instagramUserId: string
  imageUrl?: string
}

interface SupabaseFunctionResult {
  success: boolean
  data?: any[]
  error?: string
}

// Supabase function calling for OpenAI
const supabaseFunctions = [
  {
    name: "searchPromoCodesByBrand",
    description: "Search for promo codes by brand name",
    parameters: {
      type: "object",
      properties: {
        brandName: {
          type: "string",
          description: "The brand name to search for"
        }
      },
      required: ["brandName"]
    }
  },
  {
    name: "searchPromoCodesByHandle",
    description: "Search for promo codes by Instagram handle (with or without @)",
    parameters: {
      type: "object", 
      properties: {
        handle: {
          type: "string",
          description: "The Instagram handle to search for (with or without @)"
        }
      },
      required: ["handle"]
    }
  },
  {
    name: "searchPromoCodesByUrl",
    description: "Extract brand from URL and search for promo codes",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL containing brand information"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "getAlternativeBrands",
    description: "Get alternative brands with active promo codes in a similar category",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Category to search within (Fashion, Beauty, Tech, Food, Lifestyle, etc.)"
        },
        excludeBrand: {
          type: "string",
          description: "Brand name to exclude from results"
        }
      },
      required: ["category"]
    }
  },
  {
    name: "getBrandsByCategory",
    description: "Get all brands with promo codes in a specific category",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string", 
          description: "Category to search (Fashion, Beauty, Tech, Food, Lifestyle, etc.)"
        }
      },
      required: ["category"]
    }
  }
]

async function executeSupabaseFunction(functionName: string, params: any): Promise<SupabaseFunctionResult> {
  try {
    console.log(`🔍 Executing ${functionName} with params:`, params)
    
    let result: SupabaseFunctionResult
    
    switch (functionName) {
      case 'searchPromoCodesByBrand':
        result = await searchPromoCodesByBrand(params.brandName)
        break
      case 'searchPromoCodesByHandle':
        result = await searchPromoCodesByHandle(params.handle)
        break
      case 'searchPromoCodesByUrl':
        result = await searchPromoCodesByUrl(params.url)
        break
      case 'getAlternativeBrands':
        result = await getAlternativeBrands(params.category, params.excludeBrand)
        break
      case 'getBrandsByCategory':
        result = await getBrandsByCategory(params.category)
        break
      default:
        result = { success: false, error: `Unknown function: ${functionName}` }
    }
    
    // Enhanced logging for empty results
    if (result.success && (!result.data || result.data.length === 0)) {
      console.log(`📭 Function ${functionName} returned empty results - no codes found`)
    } else if (result.success && result.data) {
      console.log(`✅ Function ${functionName} returned ${result.data.length} results`)
    }
    
    return result
  } catch (error) {
    console.error(`Error executing ${functionName}:`, error)
    return { success: false, error: error.message }
  }
}

async function searchPromoCodesByBrand(brandName: string): Promise<SupabaseFunctionResult> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select(`
      id, brand_name, brand_instagram_handle, promo_code, description, 
      affiliate_link, expiration_date, category,
      profiles:influencer_id (full_name, username)
    `)
    .ilike('brand_name', `%${brandName}%`)
    .limit(5)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data || [] }
}

async function searchPromoCodesByHandle(handle: string): Promise<SupabaseFunctionResult> {
  const cleanHandle = handle.replace('@', '')
  console.log(`🔍 Searching for handle: "${cleanHandle}" (original: "${handle}")`)
  
  const { data, error } = await supabase
    .from('promo_codes')
    .select(`
      id, brand_name, brand_instagram_handle, promo_code, description,
      affiliate_link, expiration_date, category,
      profiles:influencer_id (full_name, username)
    `)
    .ilike('brand_instagram_handle', `%${cleanHandle}%`)
    .limit(5)

  console.log(`📊 Handle search results for "${cleanHandle}":`, { data, error })

  if (error) {
    console.error(`❌ Handle search error:`, error)
    return { success: false, error: error.message }
  }

  return { success: true, data: data || [] }
}

async function searchPromoCodesByUrl(url: string): Promise<SupabaseFunctionResult> {
  // Extract brand name from URL
  const brandMatch = url.match(/instagram\.com\/([^\/\?]+)/)
  if (!brandMatch) {
    return { success: false, error: 'Could not extract brand from URL' }
  }
  
  return await searchPromoCodesByHandle(brandMatch[1])
}

async function getAlternativeBrands(category: string, excludeBrand?: string): Promise<SupabaseFunctionResult> {
  let query = supabase
    .from('promo_codes')
    .select('brand_name, category')
    .ilike('category', `%${category}%`)
    .limit(10)

  if (excludeBrand) {
    query = query.not('brand_name', 'ilike', `%${excludeBrand}%`)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message }
  }

  const uniqueBrands = [...new Set(data?.map(item => item.brand_name) || [])]
  return { success: true, data: uniqueBrands.slice(0, 8) }
}

async function getBrandsByCategory(category: string): Promise<SupabaseFunctionResult> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('brand_name, category')
    .ilike('category', `%${category}%`)
    .limit(15)

  if (error) {
    return { success: false, error: error.message }
  }

  const uniqueBrands = [...new Set(data?.map(item => item.brand_name) || [])]
  return { success: true, data: uniqueBrands }
}

async function sendToOpenAI(messages: OpenAIMessage[], instagramUserId: string): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error('Missing OpenAI API key')
    return null
  }

  try {
    console.log('🤖 Sending messages to OpenAI with function calling capability')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages,
        functions: supabaseFunctions,
        function_call: "auto",
        max_completion_tokens: 400,
        temperature: 0.3,
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    console.log('🤖 OpenAI response:', JSON.stringify(data, null, 2))
    
    const choice = data.choices[0]
    
    // Handle function calling
    if (choice.message?.function_call) {
      console.log('🔧 OpenAI wants to call function:', choice.message.function_call.name)
      
      const functionName = choice.message.function_call.name
      const functionArgs = JSON.parse(choice.message.function_call.arguments)
      
      // Execute the Supabase function
      const functionResult = await executeSupabaseFunction(functionName, functionArgs)
      
      // Add function call and result to conversation
      messages.push({
        role: 'assistant',
        content: null,
        function_call: choice.message.function_call
      })
      
      messages.push({
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult)
      })
      
      // Get final response from OpenAI
      const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages,
          max_completion_tokens: 400,
          temperature: 0.3,
        })
      })
      
      if (!finalResponse.ok) {
        console.error('OpenAI final response error:', finalResponse.status, await finalResponse.text())
        return null
      }
      
      const finalData = await finalResponse.json()
      console.log('🎯 OpenAI final response:', finalData)
      
      return finalData.choices[0]?.message?.content || null
    }
    
    return choice.message?.content || null
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

async function getBrandsBySimilarity(requestedBrand: string): Promise<string[]> {
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
    console.error('Error in getBrandsBySimilarity:', error)
    return []
  }
}

async function getActualPromoCodes(brandName: string): Promise<any[]> {
  try {
    console.log(`🔍 Fetching actual promo codes for: ${brandName}`)
    
    const { data, error } = await supabase
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
      .or(`brand_name.ilike.%${brandName}%,brand_instagram_handle.ilike.%${brandName}%`)
      .limit(10)

    if (error) {
      console.error('Error fetching promo codes:', error)
      return []
    }

    console.log(`✅ Found ${data?.length || 0} actual promo codes`)
    return data || []
  } catch (error) {
    console.error('Error in getActualPromoCodes:', error)
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

function createSystemPrompt(): string {
  return `You are OfferAlert's AI Shopping Expert and Promo Code Specialist! 🛍️

PERSONALITY & APPROACH:
- You're a friendly, knowledgeable shopping expert who LOVES finding deals
- Be conversational, helpful, and enthusiastic about saving people money
- Use emojis sparingly but effectively to add personality
- Keep responses under 200 characters for Instagram DMs (be concise but helpful)

🚨 CRITICAL ANTI-HALLUCINATION RULES:
1. NEVER make up, invent, create, or suggest ANY promo codes that aren't directly returned from function calls
2. NEVER use example codes, sample codes, or placeholder codes like "SAVE20", "DISCOUNT15", etc.
3. If function calls return empty results or errors, you MUST NOT suggest any codes at all
4. When no codes are found, use ONLY the approved no-codes-found templates below
5. All promo codes must come exclusively from your Supabase function call results

GREETING RESPONSES:
When users say greetings like "hello", "hi", "hey", or similar:
- Respond warmly: "Hey! I'm your OfferAlert shopping assistant! 😊"
- Introduce yourself: "I help you find the best promo codes and deals."
- Ask for what they need: "Share a brand name or @handle and I'll hunt down the best deals for you!"
- Keep it natural and friendly, not robotic

YOUR CAPABILITIES:
You have access to these functions to search our exclusive promo code database:
- searchPromoCodesByBrand(brandName): Find codes for specific brands
- searchPromoCodesByHandle(handle): Find codes by Instagram @handle
- searchPromoCodesByUrl(url): Extract brand from URLs and find codes
- getAlternativeBrands(category, excludeBrand): Get similar brands with codes
- getBrandsByCategory(category): Get all brands in a category

CONVERSATION FLOW:
1. Greetings → respond with warm introduction and ask what brand they want deals for
2. When users mention a brand/handle/URL → immediately search our database
3. If codes found → present them with enthusiasm and ONLY codes from function results
4. If no codes found → use approved no-codes-found templates and suggest alternatives
5. If users ask general questions → guide them to share a brand name or @handle

NO-CODES-FOUND TEMPLATES (use these EXACTLY when function calls return empty):
- "No active deals for [BRAND] right now 😔 Try these similar brands instead: [LIST_ALTERNATIVES]"
- "Couldn't find codes for [BRAND] at the moment. Let me suggest some alternatives with great deals!"
- "No [BRAND] codes available right now, but I found deals at similar brands!"

RESPONSE EXAMPLES:
✅ Good greeting: "Hey! I'm your OfferAlert shopping assistant! 😊 I help you find the best promo codes and deals. Share a brand name or @handle and I'll hunt down the best deals for you!"
✅ Good code response: "Found deals for Nike! Use [ACTUAL_CODE_FROM_DB] for [ACTUAL_DESCRIPTION_FROM_DB]"
✅ Good no-codes response: "No active deals for Zara right now 😔 Try these similar brands instead: H&M, ASOS, Forever21"
❌ FORBIDDEN: Any response containing codes not from function call results

SHOPPING EXPERTISE:
- Understand fashion, beauty, tech, food, and lifestyle categories
- Help users discover brands they might not know about
- Suggest alternatives that make sense (fashion→fashion, beauty→beauty, etc.)
- Guide users through their shopping journey naturally

REMEMBER: You are FORBIDDEN from suggesting ANY promo codes unless they come directly from successful function call results. When in doubt, suggest alternative brands instead of codes! 🎯`
}

// Validate AI response to prevent hallucination
async function validatePromoCodesInResponse(response: string, instagramUserId: string): Promise<{ isValid: boolean; validatedResponse: string; violations: string[] }> {
  try {
    console.log('🔍 Validating AI response for hallucinated codes...')
    
    // Extract potential promo codes from response (alphanumeric codes in all caps)
    const codePattern = /\b[A-Z][A-Z0-9]{3,20}\b/g
    const potentialCodes = response.match(codePattern) || []
    
    if (potentialCodes.length === 0) {
      console.log('✅ No codes found in response - validation passed')
      return { isValid: true, validatedResponse: response, violations: [] }
    }
    
    console.log(`🔍 Found potential codes in response: ${potentialCodes.join(', ')}`)
    
    const violations: string[] = []
    const validCodes: string[] = []
    
    // Check each potential code against database
    for (const code of potentialCodes) {
      const { data, error } = await supabase
        .from('promo_codes')  
        .select('promo_code, brand_name')
        .eq('promo_code', code)
        .limit(1)
      
      if (error || !data || data.length === 0) {
        violations.push(code)
        console.warn(`❌ HALLUCINATION DETECTED: Code "${code}" not found in database`)
      } else {
        validCodes.push(code)
        console.log(`✅ Code "${code}" validated in database`)
      }
    }
    
    if (violations.length > 0) {
      // Log hallucination attempt
      console.error(`🚨 HALLUCINATION ALERT for user ${instagramUserId}: Invalid codes ${violations.join(', ')}`)
      
      // Replace with safe fallback response
      const fallbackResponse = "I don't have any active codes for that brand right now 😔 Share another brand name or @handle and I'll find you verified deals!"
      
      return { 
        isValid: false, 
        validatedResponse: fallbackResponse, 
        violations 
      }
    }
    
    return { isValid: true, validatedResponse: response, violations: [] }
    
  } catch (error) {
    console.error('Error in validatePromoCodesInResponse:', error)
    // Return safe fallback if validation fails
    return { 
      isValid: false, 
      validatedResponse: "I'm having trouble right now. Share a brand name or @handle and I'll find you the best deals! 🛍️",
      violations: ['validation_error'] 
    }
  }
}

async function saveConversation(instagramUserId: string, messageText: string, aiResponse: string, violations?: string[]) {
  try {
    // Update or create conversation record
    const { error: conversationError } = await supabase
      .from('user_conversations')
      .upsert({
        instagram_user_id: instagramUserId,
        last_interaction_at: new Date().toISOString(),
        conversation_context: { 
          last_message: messageText,
          hallucination_violations: violations || []
        }
      }, {
        onConflict: 'instagram_user_id'
      })

    if (conversationError) {
      console.error('Error saving conversation:', conversationError)
    }

    // Log the interaction with violation tracking
    const { error: interactionError } = await supabase
      .from('chatbase_interactions')
      .insert({
        instagram_user_id: instagramUserId,
        message_text: messageText,
        chatbase_response: aiResponse,
        response_type: violations && violations.length > 0 ? 'openai_validated' : 'openai'
      })

    if (interactionError) {
      console.error('Error saving interaction:', interactionError)
    }
    
    // Log hallucination attempts for monitoring
    if (violations && violations.length > 0) {
      console.error(`🚨 LOGGED HALLUCINATION: User ${instagramUserId} - Codes: ${violations.join(', ')}`)
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
    const { message, instagramUserId, imageUrl }: OpenAIRequest = await req.json()

    if (!message || !instagramUserId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: message, instagramUserId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('🤖 Processing OpenAI Smart Assistant request:', { message, instagramUserId, imageUrl })

    // Handle image processing for Instagram preview cards first
    if (imageUrl) {
      console.log('🖼️ Image URL provided, attempting to extract username')
      const extractedUsername = await extractUsernameFromImage(imageUrl)
      if (extractedUsername) {
        console.log(`✅ Extracted username from image: ${extractedUsername}`)
        // Continue processing with extracted username as the message
        const usernameMessage = `Looking for promo codes for @${extractedUsername}`
        
        // Get conversation history
        const conversationHistory = await getConversationHistory(instagramUserId)
        
        // Build messages array for username search
        const messages: OpenAIMessage[] = [
          { role: 'system', content: createSystemPrompt() },
          ...conversationHistory,
          { role: 'user', content: usernameMessage }
        ]

        // Send to OpenAI with function calling
        const aiResponse = await sendToOpenAI(messages, instagramUserId)
        
        if (aiResponse) {
          // Validate response for hallucinated codes
          const validation = await validatePromoCodesInResponse(aiResponse, instagramUserId)
          const finalResponse = validation.validatedResponse
          
          await saveConversation(instagramUserId, usernameMessage, finalResponse, validation.violations)
          return new Response(
            JSON.stringify({
              response: finalResponse,
              responseType: 'openai_smart',
              extractedUsername: extractedUsername,
              validated: validation.isValid
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
      }
    }

    // Get conversation history
    const conversationHistory = await getConversationHistory(instagramUserId)
    
    // Build messages array
    const messages: OpenAIMessage[] = [
      { role: 'system', content: createSystemPrompt() },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    // Send to OpenAI with function calling capabilities
    const aiResponse = await sendToOpenAI(messages, instagramUserId)

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get response from OpenAI',
          fallbackMessage: "I'm sorry, I'm having trouble right now. Tell me a brand name or @handle and I'll find you the best deals! 🛍️"
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate response for hallucinated promo codes
    const validation = await validatePromoCodesInResponse(aiResponse, instagramUserId)
    const finalResponse = validation.validatedResponse

    // Save conversation with violation tracking
    await saveConversation(instagramUserId, message, finalResponse, validation.violations)

    return new Response(
      JSON.stringify({
        response: finalResponse,
        responseType: 'openai_smart',
        validated: validation.isValid,
        violations: validation.violations.length > 0 ? validation.violations : undefined
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
        fallbackMessage: "Something went wrong! Tell me a brand or @handle and I'll help you find deals! 🛍️"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
