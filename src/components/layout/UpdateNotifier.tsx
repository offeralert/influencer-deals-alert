
import React, { useEffect, useState } from 'react';
import { checkServiceWorkerVersion, updateServiceWorker } from '@/utils/versionUtils';
import { toast } from 'sonner';

interface UpdateNotifierProps {
  checkInterval?: number; // In milliseconds
}

const UpdateNotifier: React.FC<UpdateNotifierProps> = ({ 
  checkInterval = 1000 * 60 * 30 // 30 minutes by default
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  const checkForUpdates = async () => {
    try {
      const lastKnownVersion = localStorage.getItem('app-version');
      const currentVersion = await checkServiceWorkerVersion();
      
      if (currentVersion && lastKnownVersion && lastKnownVersion !== currentVersion) {
        setUpdateAvailable(true);
        toast("Update available", {
          description: "A new version of the application is available",
          action: {
            label: "Update now",
            onClick: applyUpdate
          }
        });
      } else if (currentVersion) {
        localStorage.setItem('app-version', currentVersion);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };
  
  const applyUpdate = async () => {
    try {
      const updated = await updateServiceWorker();
      if (updated) {
        toast.success("Updating...", {
          description: "The page will refresh shortly"
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to apply update:', error);
      window.location.reload();
    }
  };
  
  useEffect(() => {
    // Check initially
    checkForUpdates();
    
    // Set up periodic checks
    const interval = setInterval(checkForUpdates, checkInterval);
    
    // Also check when the tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkInterval]);
  
  return null; // This component doesn't render anything
};

export default UpdateNotifier;
