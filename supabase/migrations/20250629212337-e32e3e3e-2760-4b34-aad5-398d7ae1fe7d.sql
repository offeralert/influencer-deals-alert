
-- Add brand_instagram_handle column to promo_codes table (required for all new codes)
ALTER TABLE public.promo_codes 
ADD COLUMN brand_instagram_handle TEXT NOT NULL DEFAULT '';

-- Add index for efficient Instagram handle lookups
CREATE INDEX idx_promo_codes_instagram_handle ON public.promo_codes(brand_instagram_handle);

-- Update the default to empty string for existing records, but new records will need to provide this
UPDATE public.promo_codes SET brand_instagram_handle = '' WHERE brand_instagram_handle IS NULL;
