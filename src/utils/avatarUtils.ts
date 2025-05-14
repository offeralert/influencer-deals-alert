
/**
 * Utility functions for handling user avatars
 */

// Default avatar image to use when a user doesn't have their own profile picture
export const DEFAULT_AVATAR_URL = "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200&h=200&fit=crop&crop=faces&auto=format";

/**
 * Gets the appropriate avatar URL to display
 * @param avatarUrl The user's avatar URL (if any)
 * @returns The URL to use for the avatar image
 */
export const getAvatarUrl = (avatarUrl: string | null | undefined): string => {
  return avatarUrl || DEFAULT_AVATAR_URL;
};

/**
 * Generates initials from a username or email
 * @param username The username to generate initials from
 * @param email Fallback email if username is not provided
 * @returns Two-character initials string
 */
export const getInitials = (username?: string | null, email?: string | null): string => {
  if (username) {
    return username.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "UN"; // Unknown - fallback
};

