
-- Enable RLS on follows table if not already enabled
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read follower counts
CREATE POLICY "Anyone can view follows for counting" 
ON public.follows 
FOR SELECT 
USING (true);
