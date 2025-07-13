
import { supabase } from "@/integrations/supabase/client";

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  if (!username || username.trim() === '') {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.trim())
      .maybeSingle();

    if (error) {
      console.error('Error checking username availability:', error);
      return false;
    }

    // Username is available if no matching record is found
    return !data;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

export const generateUsernameAlternatives = (baseUsername: string): string[] => {
  const alternatives = [];
  const cleanBase = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Add numbers to the end
  for (let i = 1; i <= 5; i++) {
    alternatives.push(`${cleanBase}${i}`);
  }
  
  // Add random suffixes
  const suffixes = ['_', 'official', 'real', 'pro', 'x'];
  suffixes.forEach(suffix => {
    alternatives.push(`${cleanBase}${suffix}`);
  });
  
  return alternatives;
};
