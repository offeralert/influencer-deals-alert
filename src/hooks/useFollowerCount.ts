import { useState } from 'react';

// This hook is now a placeholder that doesn't do anything
// We're keeping it for now to prevent breaking existing code
export const useFollowerCount = (influencerId: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return { followerCount: 0, isLoading };
};
