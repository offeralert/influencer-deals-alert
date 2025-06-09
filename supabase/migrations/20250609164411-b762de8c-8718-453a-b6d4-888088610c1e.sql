
-- Enable real-time updates for the follows table
ALTER TABLE public.follows REPLICA IDENTITY FULL;

-- Create a trigger function to sync follows table when user_domain_map changes
CREATE OR REPLACE FUNCTION public.sync_follows_table()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- When a user_domain_map entry is created, add to follows table
        INSERT INTO public.follows (user_id, influencer_id)
        VALUES (NEW.user_id, NEW.influencer_id)
        ON CONFLICT (user_id, influencer_id) DO NOTHING;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- When user_domain_map entries are deleted, check if any mappings remain
        -- If no mappings remain for this user-influencer pair, remove from follows
        IF NOT EXISTS (
            SELECT 1 FROM public.user_domain_map 
            WHERE user_id = OLD.user_id AND influencer_id = OLD.influencer_id
        ) THEN
            DELETE FROM public.follows 
            WHERE user_id = OLD.user_id AND influencer_id = OLD.influencer_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Create trigger to sync follows table when user_domain_map changes
CREATE TRIGGER sync_follows_on_domain_map_change
    AFTER INSERT OR DELETE ON public.user_domain_map
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_follows_table();

-- Add unique constraint to follows table to prevent duplicates
ALTER TABLE public.follows ADD CONSTRAINT follows_user_influencer_unique UNIQUE (user_id, influencer_id);
