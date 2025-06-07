
/**
 * Utility functions for handling user avatars
 */

// Default avatar image to use when a user doesn't have their own profile picture
export const DEFAULT_AVATAR_URL = "/lovable-uploads/11413d34-cd0f-4495-88a8-d62239cabfe5.png";

/**
 * Gets the appropriate avatar URL to display
 * @param avatarUrl The user's avatar URL (if any)
 * @returns The URL to use for the avatar image, or the default avatar if no custom avatar
 */
export const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  // Return the avatar URL if it exists and is not empty
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }
  // Return the default avatar instead of null to prevent initials fallback
  return DEFAULT_AVATAR_URL;
};

/**
 * Generates initials from a username or email
 * @param name The full name to generate initials from
 * @param username Fallback username if name is not provided
 * @param email Fallback email if neither name nor username is provided
 * @returns Single character initial string
 */
export const getInitials = (name?: string | null, username?: string | null, email?: string | null): string => {
  if (name && name.trim()) {
    return name.trim().charAt(0).toUpperCase();
  }
  if (username && username.trim()) {
    return username.trim().charAt(0).toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim().charAt(0).toUpperCase();
  }
  return "U"; // Unknown - fallback
};
