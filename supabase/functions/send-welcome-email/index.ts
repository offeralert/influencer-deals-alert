
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { UserWelcomeEmail } from "./_templates/user-welcome.tsx";
import { InfluencerWelcomeEmail } from "./_templates/influencer-welcome.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  isInfluencer: boolean;
  username?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, isInfluencer, username }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to: ${email}, isInfluencer: ${isInfluencer}`);

    let html: string;
    let subject: string;

    if (isInfluencer) {
      html = await renderAsync(
        React.createElement(InfluencerWelcomeEmail, {
          fullName,
          username: username || "",
        })
      );
      subject = "Welcome to Offer Alert - Your Influencer Journey Starts Now! 🚀";
    } else {
      html = await renderAsync(
        React.createElement(UserWelcomeEmail, {
          fullName,
        })
      );
      subject = "Welcome to Offer Alert - Start Saving with Our Browser Extension! 💰";
    }

    const emailResponse = await resend.emails.send({
      from: "Offer Alert <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
