-- Create table for storing user conversations
CREATE TABLE public.user_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_user_id TEXT NOT NULL,
  conversation_context JSONB DEFAULT '{}',
  last_interaction_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for logging Chatbase interactions
CREATE TABLE public.chatbase_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_user_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  chatbase_response TEXT,
  response_type TEXT NOT NULL DEFAULT 'chatbase', -- 'chatbase', 'promo_code', 'combined'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbase_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since these are for Instagram integration)
CREATE POLICY "Allow public read access to conversations" 
ON public.user_conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to conversations" 
ON public.user_conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to conversations" 
ON public.user_conversations 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public read access to chatbase interactions" 
ON public.chatbase_interactions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to chatbase interactions" 
ON public.chatbase_interactions 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_user_conversations_instagram_user_id ON public.user_conversations(instagram_user_id);
CREATE INDEX idx_chatbase_interactions_instagram_user_id ON public.chatbase_interactions(instagram_user_id);
CREATE INDEX idx_chatbase_interactions_created_at ON public.chatbase_interactions(created_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_conversations_updated_at
BEFORE UPDATE ON public.user_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();