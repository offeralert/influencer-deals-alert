/**
 * Utility functions for handling user avatars
 */

// Default avatar image to use when a user doesn't have their own profile picture
export const DEFAULT_AVATAR_URL = "/lovable-uploads/356ff562-0791-4751-b148-479880cae4ee.png";

/**
 * Gets the appropriate avatar URL to display
 * @param avatarUrl The user's avatar URL (if any)
 * @returns The URL to use for the avatar image, or null if no valid avatar
 */
export const getAvatarUrl = (avatarUrl: string | null | undefined): string | null => {
  // Return the avatar URL if it exists and is not the default placeholder
  if (avatarUrl && avatarUrl !== DEFAULT_AVATAR_URL && avatarUrl.trim() !== '') {
    return avatarUrl;
  }
  // Return null to trigger fallback behavior in Avatar component
  return null;
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
