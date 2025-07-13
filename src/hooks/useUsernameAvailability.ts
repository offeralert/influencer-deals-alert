
import { useState, useEffect } from 'react';
import { checkUsernameAvailability } from '@/utils/usernameUtils';

export const useUsernameAvailability = (username: string, debounceMs: number = 500) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || username.trim() === '') {
      setIsAvailable(null);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      setError(null);
      
      try {
        const available = await checkUsernameAvailability(username);
        setIsAvailable(available);
      } catch (err) {
        setError('Unable to check username availability');
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [username, debounceMs]);

  return { isChecking, isAvailable, error };
};
