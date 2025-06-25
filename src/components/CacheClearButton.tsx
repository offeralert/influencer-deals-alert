
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { clearAllCaches } from '@/utils/cacheUtils';

const CacheClearButton = () => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    
    try {
      await clearAllCaches();
      
      toast({
        title: "Cache Cleared",
        description: "All cached data has been cleared. The page will reload with the latest version.",
      });
      
      // Reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Clear Cache Failed", 
        description: "Could not clear cache. Try refreshing the page manually.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearCache}
      disabled={isClearing}
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
      {isClearing ? 'Clearing...' : 'Clear Cache'}
    </Button>
  );
};

export default CacheClearButton;
