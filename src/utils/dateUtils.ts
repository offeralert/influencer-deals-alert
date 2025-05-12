
/**
 * Check if a date is in the past
 */
export const isExpired = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const date = new Date(dateString);
  return date < today;
};

/**
 * Check if a date is within the next N days
 */
export const isExpiringSoon = (dateString: string | null | undefined, days: number = 7): boolean => {
  if (!dateString) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const date = new Date(dateString);
  
  // If it's already expired, it's not "expiring soon"
  if (date < today) return false;
  
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  return date <= futureDate;
};

/**
 * Format a date to a more user-friendly string
 */
export const formatExpiryDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "No expiration date";
  
  const date = new Date(dateString);
  return `Expires: ${date.toLocaleDateString()}`;
};
