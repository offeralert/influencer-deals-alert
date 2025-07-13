
-- Update handle_new_user function to read user type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name, 
    avatar_url,
    is_influencer,
    is_agency
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'is_influencer')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'is_agency')::boolean, false)
  );
  RETURN NEW;
END;
$$;
