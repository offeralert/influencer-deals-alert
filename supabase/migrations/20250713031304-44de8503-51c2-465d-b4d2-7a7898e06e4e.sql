
-- Create the promo_domains table
CREATE TABLE public.promo_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- The unique constraint on domain will automatically create the promo_domains_domain_key index
-- The primary key on id will automatically create the promo_domains_pkey index

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_promo_domains_updated_at
  BEFORE UPDATE ON public.promo_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.promo_domains ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (domains are not sensitive data)
CREATE POLICY "Anyone can read promo domains"
  ON public.promo_domains
  FOR SELECT
  USING (true);

-- Create policy for authenticated users to insert domains
CREATE POLICY "Authenticated users can insert promo domains"
  ON public.promo_domains
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for authenticated users to update domains
CREATE POLICY "Authenticated users can update promo domains"
  ON public.promo_domains
  FOR UPDATE
  TO authenticated
  USING (true);

-- Populate the table with existing unique domains from promo_codes
INSERT INTO public.promo_domains (domain, created_at, updated_at)
SELECT DISTINCT 
  public.extract_domain(brand_url) as domain,
  now() as created_at,
  now() as updated_at
FROM public.promo_codes 
WHERE public.extract_domain(brand_url) IS NOT NULL
ON CONFLICT (domain) DO NOTHING;
