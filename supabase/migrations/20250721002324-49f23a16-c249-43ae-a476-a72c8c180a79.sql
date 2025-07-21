
-- Phase 1: Remove follows functionality completely
-- Drop the follows table and related triggers/functions

-- First, drop the trigger that syncs follows table
DROP TRIGGER IF EXISTS sync_follows_on_domain_map_change ON public.user_domain_map;

-- Drop the function that syncs follows table
DROP FUNCTION IF EXISTS public.sync_follows_table();

-- Drop the follows table entirely
DROP TABLE IF EXISTS public.follows;

-- Phase 2: Fix and optimize domain management for promo_domains
-- Create a trigger to automatically update promo_domains when promo codes are added/updated

CREATE OR REPLACE FUNCTION public.sync_promo_domains()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    extracted_domain TEXT;
    old_domain TEXT;
BEGIN
    -- Handle INSERT and UPDATE operations
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        -- Extract domain from brand_url
        extracted_domain := public.extract_domain(NEW.brand_url);
        
        -- If there's a valid domain, add it to promo_domains
        IF extracted_domain IS NOT NULL THEN
            INSERT INTO public.promo_domains (domain)
            VALUES (extracted_domain)
            ON CONFLICT (domain) DO NOTHING;
        END IF;
    END IF;
    
    -- Handle UPDATE and DELETE operations - clean up old domains if needed
    IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        -- Extract domain from old brand_url
        IF TG_OP = 'UPDATE' THEN
            old_domain := public.extract_domain(OLD.brand_url);
        ELSE
            old_domain := public.extract_domain(OLD.brand_url);
        END IF;
        
        -- Only proceed if we have a valid old domain
        IF old_domain IS NOT NULL THEN
            -- Check if this domain is still used in any other promo_codes
            IF NOT EXISTS (
                SELECT 1 FROM public.promo_codes 
                WHERE public.extract_domain(brand_url) = old_domain
                  AND (TG_OP = 'UPDATE' AND id <> OLD.id OR TG_OP = 'DELETE' AND id <> OLD.id)
            ) THEN
                -- If domain is no longer used, remove it from promo_domains
                DELETE FROM public.promo_domains WHERE domain = old_domain;
            END IF;
        END IF;
    END IF;
    
    -- Return appropriate record based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Create trigger to sync promo_domains when promo_codes change
CREATE TRIGGER sync_promo_domains_on_promo_code_change
    AFTER INSERT OR UPDATE OR DELETE ON public.promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_promo_domains();

-- Re-populate promo_domains with current promo codes using updated extract_domain function
INSERT INTO public.promo_domains (domain)
SELECT DISTINCT public.extract_domain(brand_url) as domain
FROM public.promo_codes
WHERE public.extract_domain(brand_url) IS NOT NULL
ON CONFLICT (domain) DO NOTHING;

-- Clean up any duplicate triggers on promo_codes (keeping only the new one and the existing sync_user_domain_map)
-- Remove the old trigger that might exist
DROP TRIGGER IF EXISTS sync_user_domain_map_trigger ON public.promo_codes;

-- Recreate the user_domain_map sync trigger without follows dependency
CREATE TRIGGER sync_user_domain_map_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_domain_map();
