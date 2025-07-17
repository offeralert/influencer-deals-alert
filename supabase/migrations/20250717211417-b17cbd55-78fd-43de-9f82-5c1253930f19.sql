-- Final update to the extract_domain function for robust international domain handling
CREATE OR REPLACE FUNCTION public.extract_domain(url text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
    domain TEXT;
    domain_parts TEXT[];
    part_count INT;
    second_level_domain TEXT;
    top_level_domain TEXT;
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
    part_count := array_length(domain_parts, 1);
    
    -- Handle special cases for country-specific TLDs
    IF part_count >= 2 THEN
        -- Get the top level domain (last part)
        top_level_domain := domain_parts[part_count];
        
        -- For special country TLDs, use special handling
        IF top_level_domain = 'uk' AND part_count >= 3 AND domain_parts[part_count-1] = 'co' THEN
            -- Handle .co.uk format
            second_level_domain := domain_parts[part_count-2];
            RETURN second_level_domain || '.co.uk';
        ELSIF top_level_domain = 'au' AND part_count >= 3 AND domain_parts[part_count-1] = 'com' THEN
            -- Handle .com.au format
            second_level_domain := domain_parts[part_count-2];
            RETURN second_level_domain || '.com.au';
        ELSIF top_level_domain = 'in' AND part_count >= 3 AND domain_parts[part_count-1] = 'co' THEN
            -- Handle .co.in format
            second_level_domain := domain_parts[part_count-2];
            RETURN second_level_domain || '.co.in';
        ELSIF top_level_domain = 'ca' AND part_count >= 3 AND 
              (domain_parts[part_count-1] = 'co' OR domain_parts[part_count-1] = 'com') THEN
            -- Handle .co.ca and .com.ca formats
            second_level_domain := domain_parts[part_count-2];
            RETURN second_level_domain || '.' || domain_parts[part_count-1] || '.ca';
        END IF;
    END IF;
    
    -- Default case: for regular domains or unknown formats, return as is
    RETURN domain;
END;
$function$;