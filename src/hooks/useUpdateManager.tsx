
import { useState, useEffect } from 'react';
import { checkForUpdates, applyUpdate, forceRefreshCriticalResources } from '@/utils/cacheUtils';
import { toast } from '@/hooks/use-toast';

export const useUpdateManager = (enabled: boolean = true) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let interval: NodeJS.Timeout;

    const checkUpdates = async () => {
      try {
        const hasUpdate = await checkForUpdates();
        if (hasUpdate && !updateAvailable) {
          setUpdateAvailable(true);
          showUpdateNotification();
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Check for updates immediately
    checkUpdates();
    
    // Check for updates every 2 minutes (aggressive)
    interval = setInterval(checkUpdates, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [updateAvailable, enabled]);

  const showUpdateNotification = () => {
    toast({
      title: "New Version Available",
      description: "A new version is available. Update now for the latest features.",
      action: (
        <button
          onClick={handleApplyUpdate}
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
          disabled={isApplyingUpdate}
        >
          {isApplyingUpdate ? 'Updating...' : 'Update Now'}
        </button>
      ),
    });
  };

  const handleApplyUpdate = async () => {
    setIsApplyingUpdate(true);
    
    try {
      // Force refresh critical resources first
      await forceRefreshCriticalResources();
      // Then apply the update
      await applyUpdate();
    } catch (error) {
      console.error('Error applying update:', error);
      toast({
        title: "Update Applied",
        description: "The page will refresh to load the latest version.",
        variant: "default"
      });
      // Force reload as fallback
      setTimeout(() => window.location.reload(), 1000);
    } finally {
      setIsApplyingUpdate(false);
    }
  };

  return {
    updateAvailable,
    isApplyingUpdate,
    applyUpdate: handleApplyUpdate,
    checkForUpdates: () => checkForUpdates().then(setUpdateAvailable)
  };
};
