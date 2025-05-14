
/**
 * Check if a date is expired (before today)
 */
export function isExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  return expiry < today;
}

/**
 * Check if a date is expiring soon (within the next 7 days)
 */
export function isExpiringSoon(expiryDate: string | null): boolean {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  
  // Consider "soon" as within 7 days
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  
  return expiry >= today && expiry <= sevenDaysFromNow;
}
