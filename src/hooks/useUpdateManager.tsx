
import { useState, useEffect, useRef } from 'react';
import { checkForUpdates, applyUpdate } from '@/utils/cacheUtils';
import { toast } from '@/hooks/use-toast';

export const useUpdateManager = (enabled: boolean = true) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);
  const hasShownUpdateNotification = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let interval: NodeJS.Timeout;
    let initialTimeout: NodeJS.Timeout;

    const checkUpdates = async () => {
      try {
        const hasUpdate = await checkForUpdates();
        
        if (hasUpdate && !updateAvailable && !hasShownUpdateNotification.current) {
          console.log('Update detected, showing notification');
          setUpdateAvailable(true);
          showUpdateNotification();
          hasShownUpdateNotification.current = true;
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Check for updates every 10 minutes (increased from 5)
    interval = setInterval(checkUpdates, 10 * 60 * 1000);
    
    // Initial check after 60 seconds (increased from 30)
    initialTimeout = setTimeout(checkUpdates, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [updateAvailable, enabled]);

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
    checkForUpdates: () => checkForUpdates().then(hasUpdate => {
      if (hasUpdate && !hasShownUpdateNotification.current) {
        setUpdateAvailable(hasUpdate);
        hasShownUpdateNotification.current = true;
      }
    })
  };
};
