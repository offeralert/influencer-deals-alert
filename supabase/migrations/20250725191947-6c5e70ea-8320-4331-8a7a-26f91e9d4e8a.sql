-- Retroactively insert all domains from existing promo codes into promo_domains table
INSERT INTO public.promo_domains (domain)
SELECT DISTINCT public.extract_domain(brand_url) as domain
FROM public.promo_codes 
WHERE brand_url IS NOT NULL 
  AND brand_url != ''
  AND public.extract_domain(brand_url) IS NOT NULL
  AND public.extract_domain(brand_url) NOT IN (
    SELECT domain FROM public.promo_domains WHERE domain IS NOT NULL
  )
ON CONFLICT (domain) DO NOTHING;