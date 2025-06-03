
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
    console.log("=== WELCOME EMAIL FUNCTION STARTED ===");
    console.log("Timestamp:", new Date().toISOString());
    
    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("❌ CRITICAL: RESEND_API_KEY environment variable is not set");
      throw new Error("Email service not configured - RESEND_API_KEY missing");
    }
    console.log("✅ RESEND_API_KEY is available (length:", resendApiKey.length, ")");

    // Parse request body
    const requestBody = await req.text();
    console.log("📝 Raw request body received:", requestBody);
    
    let parsedBody: WelcomeEmailRequest;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("❌ JSON parsing failed:", parseError);
      throw new Error("Invalid JSON in request body");
    }
    
    const { email, fullName, isInfluencer, username } = parsedBody;

    console.log("📧 Parsed email request details:", {
      email: email || "MISSING",
      fullName: fullName || "MISSING", 
      isInfluencer: isInfluencer,
      username: username || "N/A",
      emailValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")
    });

    // Validate required fields
    if (!email || !fullName) {
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!fullName) missingFields.push("fullName");
      console.error("❌ Missing required fields:", missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("❌ Invalid email format:", email);
      throw new Error("Invalid email format");
    }

    let html: string;
    let subject: string;
    let templateType: string;

    try {
      if (isInfluencer) {
        console.log("🎯 Rendering influencer welcome email template");
        templateType = "influencer";
        html = await renderAsync(
          React.createElement(InfluencerWelcomeEmail, {
            fullName,
            username: username || "",
          })
        );
        subject = "Welcome to Offer Alert - Your Influencer Journey Starts Now! 🚀";
      } else {
        console.log("👤 Rendering user welcome email template");
        templateType = "user";
        html = await renderAsync(
          React.createElement(UserWelcomeEmail, {
            fullName,
          })
        );
        subject = "Welcome to Offer Alert - Start Saving with Our Browser Extension! 💰";
      }
      
      console.log("✅ Email template rendered successfully:", {
        type: templateType,
        htmlLength: html.length,
        subject: subject
      });
    } catch (renderError) {
      console.error("❌ Template rendering failed:", renderError);
      throw new Error(`Template rendering failed: ${renderError.message}`);
    }

    // Prepare email data
    const emailData = {
      from: "Offer Alert <hello@offeralert.io>",
      to: [email],
      subject,
      html,
    };

    console.log("📤 Preparing to send email:", {
      from: emailData.from,
      to: emailData.to[0],
      subject: emailData.subject,
      htmlLength: emailData.html.length,
      recipientCount: emailData.to.length
    });

    // Send email with detailed error handling
    let emailResponse;
    try {
      console.log("🚀 Calling Resend API...");
      emailResponse = await resend.emails.send(emailData);
      console.log("📨 Resend API raw response:", JSON.stringify(emailResponse, null, 2));
    } catch (resendError: any) {
      console.error("❌ Resend API call failed:", {
        message: resendError.message,
        stack: resendError.stack,
        name: resendError.name,
        status: resendError.status,
        statusText: resendError.statusText
      });
      
      // Check for specific error types
      if (resendError.message?.includes("domain")) {
        console.error("🌐 DOMAIN ISSUE: Domain verification problem detected");
        throw new Error("Domain verification issue: Ensure hello@offeralert.io domain is verified in Resend");
      } else if (resendError.message?.includes("API key")) {
        console.error("🔑 API KEY ISSUE: Invalid or expired API key");
        throw new Error("API key issue: Check if RESEND_API_KEY is valid and active");
      } else if (resendError.message?.includes("rate limit")) {
        console.error("⏰ RATE LIMIT: Too many requests");
        throw new Error("Rate limit exceeded: Please try again later");
      }
      
      throw new Error(`Resend API error: ${resendError.message}`);
    }

    // Check response for errors
    if (emailResponse.error) {
      console.error("❌ Resend returned an error:", emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message || JSON.stringify(emailResponse.error)}`);
    }

    if (!emailResponse.data) {
      console.error("❌ No data in Resend response:", emailResponse);
      throw new Error("Email sending failed: No data returned from Resend");
    }

    console.log("✅ EMAIL SENT SUCCESSFULLY!", {
      id: emailResponse.data.id,
      from: emailData.from,
      to: emailData.to[0],
      subject: emailData.subject
    });

    return new Response(JSON.stringify({
      success: true,
      data: emailResponse.data,
      message: "Welcome email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ ERROR in send-welcome-email function:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        suggestion: "Check function logs for detailed error information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
