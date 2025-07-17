-- Add agency_id column to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN agency_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to allow agencies to view their own subscription
DROP POLICY IF EXISTS "Agencies can view their own subscription" ON public.subscribers;
CREATE POLICY "Agencies can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING ((auth.uid() = agency_id) OR (email = auth.email()));

DROP POLICY IF EXISTS "Agencies can update their own subscription" ON public.subscribers;
CREATE POLICY "Agencies can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING ((auth.uid() = agency_id) OR (email = auth.email()));