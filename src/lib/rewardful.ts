
/**
 * Rewardful integration utility
 * Handles affiliate tracking, referral persistence, and conversion tracking
 */

// Save referral ID to localStorage when present in URL
export const captureReferral = (): void => {
  try {
    // Check for referral ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const referralId = urlParams.get('_rwid');
    
    if (referralId) {
      // Store the referral ID in localStorage
      localStorage.setItem('rewardful_referral', referralId);
      console.log('Rewardful referral captured:', referralId);
    }
  } catch (error) {
    console.error('Error capturing Rewardful referral:', error);
  }
};

// Track conversion (call on successful signup or purchase)
export const trackConversion = (data: {
  value?: number;
  currency?: string;
  orderId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  customerId?: string;
}): void => {
  try {
    if (window.rewardful && typeof window.rewardful === 'function') {
      console.log('Calling Rewardful convert with data:', data);
      window.rewardful('convert', data);
      console.log('Rewardful conversion tracked successfully');
    } else {
      console.error('Rewardful not available for conversion tracking');
    }
  } catch (error) {
    console.error('Error tracking Rewardful conversion:', error);
  }
};

// Get stored referral ID (if any)
export const getReferralId = (): string | null => {
  try {
    const referralId = localStorage.getItem('rewardful_referral');
    console.log('Retrieved Rewardful referral ID:', referralId);
    return referralId;
  } catch (error) {
    console.error('Error getting stored Rewardful referral:', error);
    return null;
  }
};

// Create a referral link for a specific affiliate
export const createAffiliateLink = (baseUrl: string, affiliateId: string): string => {
  const url = new URL(baseUrl);
  url.searchParams.append('_rwid', affiliateId);
  return url.toString();
};
