
-- Remove the is_influencer column from the profiles table
ALTER TABLE public.profiles DROP COLUMN is_influencer;

-- Update the check_influencer_id function to work without is_influencer
-- Now considers users as influencers by default (unless they are agencies or credit cards)
DROP FUNCTION IF EXISTS public.check_influencer_id();

CREATE OR REPLACE FUNCTION public.check_influencer_id()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = NEW.influencer_id 
    AND (profiles.is_agency IS NOT TRUE AND profiles.is_creditcard IS NOT TRUE)
  ) THEN
    RAISE EXCEPTION 'influencer_id must reference a user who can be an influencer (not an agency or credit card)';
  END IF;
  RETURN NEW;
END;
$function$;
