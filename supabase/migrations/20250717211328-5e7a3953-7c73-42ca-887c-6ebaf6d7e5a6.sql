-- Update the extract_domain function with improved handling for international domains
CREATE OR REPLACE FUNCTION public.extract_domain(url text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
    domain TEXT;
    domain_parts TEXT[];
    special_tlds TEXT[] := ARRAY['com.au', 'co.uk', 'co.in', 'com.ca', 'co.ca'];
    main_part TEXT;
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
    
    -- If we have at least 2 parts
    IF array_length(domain_parts, 1) >= 2 THEN
        -- Check for common two-level TLDs (e.g., co.uk, com.au)
        -- First check if the last two parts together form a special TLD
        IF array_length(domain_parts, 1) >= 3 THEN
            -- For multi-part domains (e.g., something.example.co.uk)
            -- Check if last two parts match any of our special country TLDs
            IF domain_parts[array_length(domain_parts, 1)] = ANY(ARRAY['uk', 'au', 'in', 'ca']) THEN
                -- Get the last two parts together
                IF domain_parts[array_length(domain_parts, 1) - 1] || '.' || domain_parts[array_length(domain_parts, 1)] = ANY(special_tlds) THEN
                    -- Return domain name with the special TLD
                    -- For example: example.co.uk (not subdomain.example.co.uk)
                    main_part := domain_parts[array_length(domain_parts, 1) - 2];
                    RETURN main_part || '.' || domain_parts[array_length(domain_parts, 1) - 1] || '.' || domain_parts[array_length(domain_parts, 1)];
                END IF;
            END IF;
        END IF;
    END IF;
    
    -- Default case: return the domain as is
    RETURN domain;
END;
$function$;