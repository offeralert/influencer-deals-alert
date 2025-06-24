
import { useState, useEffect } from 'react';
import { checkForUpdates, applyUpdate } from '@/utils/cacheUtils';
import { toast } from '@/hooks/use-toast';

export const useUpdateManager = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);

  useEffect(() => {
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

    // Check for updates every 5 minutes
    interval = setInterval(checkUpdates, 5 * 60 * 1000);
    
    // Initial check after 30 seconds
    const initialTimeout = setTimeout(checkUpdates, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [updateAvailable]);

  const showUpdateNotification = () => {
    toast({
      title: "Update Available",
      description: "A new version of the app is available. Click to update.",
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
      await applyUpdate();
    } catch (error) {
      console.error('Error applying update:', error);
      toast({
        title: "Update Failed",
        description: "Failed to apply update. Please refresh the page manually.",
        variant: "destructive"
      });
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
