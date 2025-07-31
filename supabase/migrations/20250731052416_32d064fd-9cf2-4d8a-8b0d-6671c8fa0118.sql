-- Fix existing promo codes to populate agency_id where appropriate
-- This identifies promo codes that were created by agencies but are missing agency_id

-- Update promo codes where the influencer_id doesn't match a real influencer profile
-- and there's an agency that manages this influencer
UPDATE public.promo_codes 
SET agency_id = ai.agency_id
FROM public.agency_influencers ai
WHERE promo_codes.influencer_id = ai.influencer_id
  AND promo_codes.agency_id IS NULL
  AND ai.managed_by_agency = true;

-- Alternative approach: Update based on profiles table
-- If a promo code's influencer_id points to an agency profile, find the real influencer
UPDATE public.promo_codes 
SET agency_id = promo_codes.influencer_id
FROM public.profiles p
WHERE promo_codes.influencer_id = p.id
  AND p.is_agency = true
  AND promo_codes.agency_id IS NULL;