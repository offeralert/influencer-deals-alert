-- Create trigger to automatically sync promo domains when promo codes are modified
CREATE TRIGGER sync_promo_domains_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_promo_domains();