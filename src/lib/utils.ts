
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to check if a date is expired
export function isExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  return expiry < today;
}

// Helper function to check if a date is expiring soon (within 7 days)
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

// Format expiry date for display
export function formatExpiryDate(dateString: string | null): string {
  if (!dateString) return "No expiration";
  return new Date(dateString).toLocaleDateString();
}
