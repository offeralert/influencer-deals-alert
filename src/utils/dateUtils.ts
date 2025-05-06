
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
  if (!dateString) return "No expiration";
  
  const date = new Date(dateString);
  
  // If it's expired
  if (isExpired(dateString)) {
    return `Expired (${date.toLocaleDateString()})`;
  }
  
  // If it's expiring within 7 days
  if (isExpiringSoon(dateString)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  }
  
  // Regular date format
  return date.toLocaleDateString();
};
