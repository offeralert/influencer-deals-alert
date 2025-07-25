-- Update promo codes table to fix agency_id and influencer_id relationships

-- For the Runna promo code (LEAHB) that should be attributed to leahballlifts instead of the agency
UPDATE public.promo_codes 
SET 
  agency_id = '57d2b03b-4d21-47f8-be70-47d8038d4cfb',
  influencer_id = '0bedd10c-6d62-4581-a961-7ddcd081be03'
WHERE id = '6cd993ab-d4c5-4876-a714-aa86c6b0f7ad'
  AND promo_code = 'LEAHB'
  AND brand_name = 'Runna';

-- For any other promo codes created by agencies that should have proper attribution
-- This handles cases where the influencer_id points to an agency instead of the actual influencer
UPDATE public.promo_codes 
SET agency_id = influencer_id
WHERE influencer_id IN (
  SELECT id FROM public.profiles WHERE is_agency = true
) AND agency_id IS NULL;