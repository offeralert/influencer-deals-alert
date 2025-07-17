-- Update the extract_domain function to handle international domains
CREATE OR REPLACE FUNCTION public.extract_domain(url text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
    domain TEXT;
    domain_parts TEXT[];
    tld TEXT;
    base_domain TEXT;
BEGIN
    -- Check for NULL or empty URL
    IF url IS NULL OR url = '' THEN
        RETURN NULL;
    END IF;
    
    -- Remove protocol
    domain := regexp_replace(url, '^https?://', '');
    
    -- Extract domain part (before first / or ? or #)
    domain := split_part(domain, '/', 1);
    domain := split_part(domain, '?', 1);
    domain := split_part(domain, '#', 1);
    
    -- Remove www. prefix if present
    domain := regexp_replace(domain, '^www\.', '');
    
    -- Split domain into parts by dots
    domain_parts := string_to_array(domain, '.');
    
    -- Handle special cases for country-specific TLDs
    -- If we have enough parts and a known country pattern
    IF array_length(domain_parts, 1) >= 3 THEN
        -- Extract the last two parts to check for country-specific TLDs
        tld := domain_parts[array_length(domain_parts, 1) - 1] || '.' || domain_parts[array_length(domain_parts, 1)];
        
        -- Check if it's one of our special country TLDs
        IF tld IN ('com.au', 'co.uk', 'co.in', 'co.ca', 'com.ca') THEN
            -- For these special TLDs, we want the last 3 parts (e.g., example.com.au)
            IF array_length(domain_parts, 1) >= 3 THEN
                base_domain := domain_parts[array_length(domain_parts, 1) - 2] || '.' || tld;
                RETURN base_domain;
            END IF;
        END IF;
    END IF;
    
    -- Default case: return the domain as is
    RETURN domain;
END;
$function$;