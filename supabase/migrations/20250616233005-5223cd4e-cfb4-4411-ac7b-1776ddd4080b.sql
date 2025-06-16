
-- Add INSERT policies to profiles table to allow user creation through triggers
-- This allows the handle_new_user() trigger to create profiles when Auth users are created

CREATE POLICY "Allow authenticated users to insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert profiles (needed for edge function user creation)
CREATE POLICY "Service role can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);
