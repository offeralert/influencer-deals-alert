
-- Add is_fake column to profiles table to identify manually added influencer accounts
ALTER TABLE public.profiles 
ADD COLUMN is_fake BOOLEAN NOT NULL DEFAULT false;

-- Add comment to explain the purpose of this column
COMMENT ON COLUMN public.profiles.is_fake IS 'Identifies manually added influencer accounts that should bypass promo code limitations';
