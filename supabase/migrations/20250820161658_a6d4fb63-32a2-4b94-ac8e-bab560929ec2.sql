-- Create web chat sessions table for the shopping assistant
CREATE TABLE public.web_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  message_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.web_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (session-based, no auth required)
CREATE POLICY "Anyone can view web chat sessions" 
ON public.web_chat_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert web chat sessions" 
ON public.web_chat_sessions 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance on session queries
CREATE INDEX idx_web_chat_sessions_session_id ON public.web_chat_sessions(session_id);
CREATE INDEX idx_web_chat_sessions_created_at ON public.web_chat_sessions(created_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_web_chat_sessions_updated_at
BEFORE UPDATE ON public.web_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();