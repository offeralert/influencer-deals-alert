
import { supabase } from "@/integrations/supabase/client";

interface SendWelcomeEmailParams {
  email: string;
  fullName: string;
  isInfluencer: boolean;
  username?: string;
}

export const sendWelcomeEmail = async (params: SendWelcomeEmailParams) => {
  try {
    console.log('Sending welcome email:', params);
    
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: params,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    console.log('Welcome email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};
