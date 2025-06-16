
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateInfluencerRequest {
  full_name: string;
  username: string;
  email: string;
  bio?: string;
}

interface CreateInfluencerResponse {
  success: boolean;
  influencer?: {
    id: string;
    email: string;
    temporary_password: string;
    full_name: string;
    username: string;
  };
  error?: string;
}

// Generate a secure temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the request is from an authenticated agency
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Create regular client to verify agency permissions
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    // Verify user is an agency
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_agency")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.is_agency) {
      throw new Error("Only agencies can create influencer users");
    }

    const requestData: CreateInfluencerRequest = await req.json();
    
    // Validate required fields
    if (!requestData.full_name || !requestData.username || !requestData.email) {
      throw new Error("Full name, username, and email are required");
    }

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUser.users.some(u => u.email === requestData.email);
    
    if (emailExists) {
      throw new Error("Email address is already in use");
    }

    // Check if username already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("username", requestData.username)
      .single();

    if (existingProfile) {
      throw new Error("Username is already taken");
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Create the user with admin privileges
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: requestData.email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: requestData.full_name,
        username: requestData.username,
        is_influencer: true,
      },
    });

    if (createError || !newUser.user) {
      console.error("Error creating user:", createError);
      throw new Error(`Failed to create user: ${createError?.message || "Unknown error"}`);
    }

    // Update the profile that was automatically created by the trigger
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        username: requestData.username,
        full_name: requestData.full_name,
        is_influencer: true,
      })
      .eq("id", newUser.user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      // Don't throw here as the user was created successfully
    }

    // Create agency-influencer relationship
    const { error: relationshipError } = await supabaseAdmin
      .from("agency_influencers")
      .insert({
        agency_id: user.id,
        influencer_id: newUser.user.id,
        managed_by_agency: true,
      });

    if (relationshipError) {
      console.error("Error creating agency relationship:", relationshipError);
      // Don't throw here as the user was created successfully
    }

    const response: CreateInfluencerResponse = {
      success: true,
      influencer: {
        id: newUser.user.id,
        email: requestData.email,
        temporary_password: temporaryPassword,
        full_name: requestData.full_name,
        username: requestData.username,
      },
    };

    console.log("Influencer user created successfully:", newUser.user.id);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in create-influencer-user function:", error);
    
    const response: CreateInfluencerResponse = {
      success: false,
      error: error.message || "Failed to create influencer user",
    };

    return new Response(JSON.stringify(response), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
