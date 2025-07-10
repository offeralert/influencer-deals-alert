
import { supabase } from "@/integrations/supabase/client";

interface SendWelcomeEmailParams {
  email: string;
  fullName: string;
  isInfluencer: boolean;
  isAgency?: boolean;
  username?: string;
}

export const sendWelcomeEmail = async (params: SendWelcomeEmailParams) => {
  try {
    console.log('📧 Calling send-welcome-email function with params:', {
      email: params.email,
      fullName: params.fullName,
      isInfluencer: params.isInfluencer,
      isAgency: params.isAgency || false,
      username: params.username || 'N/A'
    });
    
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: params,
    });

    console.log('📨 Function response received:', { data, error });

    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(`Email function error: ${error.message || 'Unknown error'}`);
    }

    if (data && !data.success) {
      console.error('❌ Email function returned failure:', data);
      throw new Error(data.error || 'Email sending failed');
    }

    console.log('✅ Welcome email function completed successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to invoke welcome email function:', error);
    throw error;
  }
};
