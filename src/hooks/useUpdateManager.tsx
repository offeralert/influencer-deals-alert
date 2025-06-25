
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
          console.log('Confirmed update detected, showing notification');
          setUpdateAvailable(true);
          showUpdateNotification();
          hasShownUpdateNotification.current = true;
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Much longer intervals - check for updates every 30 minutes (increased from 10)
    interval = setInterval(checkUpdates, 30 * 60 * 1000);
    
    // Initial check after 5 minutes (increased from 60 seconds)
    initialTimeout = setTimeout(checkUpdates, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [updateAvailable, enabled]);

  const showUpdateNotification = () => {
    toast({
      title: "App Update Available",
      description: "A new version has been confirmed. Click to update now.",
      action: (
        <button
          onClick={handleApplyUpdate}
          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
          disabled={isApplyingUpdate}
        >
          {isApplyingUpdate ? 'Updating...' : 'Update Now'}
        </button>
      ),
      duration: 10000, // Show for 10 seconds
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
