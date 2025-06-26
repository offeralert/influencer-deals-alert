
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

interface DebugStats {
  totalPromoCodes: number;
  validInfluencerCodes: number;
  displayedDeals: number;
  invalidCodes: Array<{
    id: string;
    brand_name: string;
    influencer_username: string;
    issue: string;
  }>;
}

interface PromoCodeDebugPanelProps {
  displayedDealsCount: number;
  onRefresh: () => void;
}

const PromoCodeDebugPanel = ({ displayedDealsCount, onRefresh }: PromoCodeDebugPanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugStats, setDebugStats] = useState<DebugStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugStats = async () => {
    setLoading(true);
    try {
      console.log('[DEBUG] Fetching debug statistics...');
      
      // Get total promo codes
      const { data: allCodes, error: codesError } = await supabase
        .from('promo_codes')
        .select(`
          id,
          brand_name,
          promo_code,
          influencer_id,
          profiles:influencer_id (
            id,
            full_name,
            username,
            is_influencer
          )
        `);

      if (codesError) {
        console.error('[DEBUG] Error fetching promo codes:', codesError);
        return;
      }

      const totalPromoCodes = allCodes?.length || 0;
      console.log(`[DEBUG] Total promo codes in database: ${totalPromoCodes}`);

      // Analyze valid vs invalid codes
      const invalidCodes: DebugStats['invalidCodes'] = [];
      let validInfluencerCodes = 0;

      allCodes?.forEach(code => {
        if (!code.profiles) {
          invalidCodes.push({
            id: code.id,
            brand_name: code.brand_name,
            influencer_username: 'unknown',
            issue: 'No associated profile found'
          });
        } else if (!code.profiles.is_influencer) {
          invalidCodes.push({
            id: code.id,
            brand_name: code.brand_name,
            influencer_username: code.profiles.username || 'unknown',
            issue: 'Profile is not marked as influencer'
          });
        } else {
          validInfluencerCodes++;
        }
      });

      console.log(`[DEBUG] Valid influencer codes: ${validInfluencerCodes}`);
      console.log(`[DEBUG] Invalid codes: ${invalidCodes.length}`);
      console.log(`[DEBUG] Currently displayed deals: ${displayedDealsCount}`);

      setDebugStats({
        totalPromoCodes,
        validInfluencerCodes,
        displayedDeals: displayedDealsCount,
        invalidCodes
      });

    } catch (error) {
      console.error('[DEBUG] Error in fetchDebugStats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchDebugStats();
    }
  }, [isVisible, displayedDealsCount]);

  const handleRefresh = () => {
    fetchDebugStats();
    onRefresh();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
        >
          <Eye className="h-4 w-4 mr-1" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm text-yellow-800">Promo Code Debug</CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          {debugStats ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="font-medium text-yellow-800">Total Codes</div>
                  <div className="text-lg font-bold">{debugStats.totalPromoCodes}</div>
                </div>
                <div>
                  <div className="font-medium text-yellow-800">Valid Codes</div>
                  <div className="text-lg font-bold text-green-600">{debugStats.validInfluencerCodes}</div>
                </div>
              </div>
              
              <div>
                <div className="font-medium text-yellow-800">Currently Displayed</div>
                <div className="text-lg font-bold text-blue-600">{debugStats.displayedDeals}</div>
              </div>

              {debugStats.invalidCodes.length > 0 && (
                <div>
                  <div className="font-medium text-yellow-800 mb-1">Issues Found:</div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {debugStats.invalidCodes.map((code, index) => (
                      <div key={index} className="text-xs bg-red-50 p-1 rounded">
                        <div className="font-medium">{code.brand_name}</div>
                        <div className="text-red-600">{code.issue}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debugStats.validInfluencerCodes !== debugStats.displayedDeals && (
                <div className="bg-red-100 p-2 rounded text-red-800 text-xs">
                  ⚠️ Mismatch detected! {debugStats.validInfluencerCodes - debugStats.displayedDeals} valid codes not displayed
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              {loading ? 'Loading debug info...' : 'Click refresh to load stats'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoCodeDebugPanel;
