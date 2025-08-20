import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface WebChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WebChatRequest {
  sessionId: string;
  message: string;
  imageUrl?: string;
}

// Save conversation to database
async function saveConversation(sessionId: string, role: 'user' | 'assistant', content: string) {
  try {
    const { error } = await supabase
      .from('web_chat_sessions')
      .insert({
        session_id: sessionId,
        role: role,
        content: content
      });

    if (error) {
      console.error('Error saving web chat conversation:', error);
    }
  } catch (error) {
    console.error('Error saving web chat conversation:', error);
  }
}

// Get conversation history
async function getConversationHistory(sessionId: string): Promise<WebChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('web_chat_sessions')
      .select('role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }

    return data?.map(row => ({
      role: row.role as 'user' | 'assistant',
      content: row.content
    })) || [];
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}

// Check if message is likely a brand or handle search
function isBrandOrHandleMessage(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  
  // Handle starts with @
  if (trimmed.startsWith('@')) {
    return true;
  }
  
  // Short phrases likely to be brands (1-4 words, under 50 chars)
  const words = trimmed.split(/\s+/);
  if (words.length <= 4 && trimmed.length <= 50) {
    // Exclude very common conversational phrases
    const conversationalPhrases = [
      'hello', 'hi', 'hey', 'thanks', 'thank you', 'yes', 'no', 'ok', 'okay',
      'how are you', 'what\'s up', 'good morning', 'good afternoon', 'good evening'
    ];
    
    if (!conversationalPhrases.includes(trimmed)) {
      return true;
    }
  }
  
  return false;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, message, imageUrl }: WebChatRequest = await req.json();

    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing sessionId or message' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🤖 Processing web chat request:', { sessionId, message, imageUrl: !!imageUrl });

    // Save user message
    await saveConversation(sessionId, 'user', message);

    // Check if this looks like a brand/handle search and send immediate response
    let shouldSendSearchingMessage = false;
    if (isBrandOrHandleMessage(message)) {
      shouldSendSearchingMessage = true;
      
      // Send immediate "searching" response
      const searchingMessage = "🔍 Searching for deals...";
      await saveConversation(sessionId, 'assistant', searchingMessage);
      console.log('💬 Sent immediate searching response');
    }

    // Call the OpenAI integration function
    const { data: aiResponse, error: aiError } = await supabase.functions.invoke('openai-integration', {
      body: { 
        message,
        instagramUserId: `web_${sessionId}`, // Use web_ prefix to distinguish from Instagram users
        imageUrl 
      }
    });

    if (aiError) {
      console.error('Error calling OpenAI integration:', aiError);
      const errorMessage = "Sorry, I'm having trouble processing your request right now. Please try again!";
      await saveConversation(sessionId, 'assistant', errorMessage);
      
      return new Response(
        JSON.stringify({ 
          response: errorMessage,
          conversation: await getConversationHistory(sessionId)
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const assistantResponse = aiResponse?.response || "I'm here to help you find the best deals! Try sharing a brand name or @handle.";
    
    // Only save the AI response if we didn't already send a "searching" message
    // (to avoid duplicate responses when both searching message and AI response are the same)
    if (!shouldSendSearchingMessage || assistantResponse !== "🔍 Searching for deals...") {
      await saveConversation(sessionId, 'assistant', assistantResponse);
    }

    // Get updated conversation history
    const conversation = await getConversationHistory(sessionId);

    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        conversation: conversation
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in web-chat-assistant function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});