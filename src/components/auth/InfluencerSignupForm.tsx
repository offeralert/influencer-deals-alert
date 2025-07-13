
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { useMetaTracking } from "@/hooks/useMetaTracking";
import { createLeadPayload } from "@/utils/metaTrackingHelpers";
import { sendWelcomeEmail } from "@/utils/emailUtils";
import { useAuth } from "@/contexts/AuthContext";
import UsernameInput from "./UsernameInput";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";

const InfluencerSignupForm = () => {
  const navigate = useNavigate();
  const { track } = useMetaTracking();
  const { refreshProfile, setJustSignedUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    socialHandle: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const { isAvailable: isUsernameAvailable } = useUsernameAvailability(formData.socialHandle);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialHandleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, socialHandle: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }

    if (isUsernameAvailable === false) {
      toast.error("Username is already taken. Please choose a different one.");
      return;
    }

    if (isUsernameAvailable === null) {
      toast.error("Please wait while we check username availability");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("🚀 Starting influencer signup process for:", formData.email);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.socialHandle,
          },
        },
      });

      if (error) {
        console.error("❌ Signup error:", error);
        
        // Handle specific username constraint error
        if (error.message.includes('profiles_username_key') || error.message.includes('duplicate key')) {
          toast.error("This username is already taken. Please choose a different one.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        console.log("✅ User created successfully:", data.user.id);
        
        // Update the profile to set is_influencer to true
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_influencer: true })
          .eq('id', data.user.id);

        if (profileError) {
          console.error("❌ Error updating profile:", profileError);
          
          // Handle specific username constraint error in profile update
          if (profileError.message.includes('profiles_username_key') || profileError.message.includes('duplicate key')) {
            toast.error("This username is already taken. Please try signing up with a different username.");
          } else {
            toast.error("Account created but influencer status couldn't be updated");
          }
          return;
        }
        
        console.log("✅ Profile updated to influencer successfully");
        
        // Set flag to indicate fresh signup
        setJustSignedUp(true);
        
        // Refresh the profile in auth context to ensure latest data
        console.log("🔄 Refreshing profile in auth context...");
        await refreshProfile();
        
        // Add a small delay to ensure profile state is fully updated
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("✅ Profile refreshed in auth context");
        
        // Track successful influencer signup with Meta
        try {
          await track('InfluencerSignup', createLeadPayload({
            content_name: 'influencer_registration',
            content_category: 'influencer_signup',
            lead_type: 'influencer_application',
            value: 0
          }));
          console.log("✅ Meta tracking event sent");
        } catch (trackingError) {
          console.error("❌ Meta tracking failed:", trackingError);
          // Don't block signup for tracking failure
        }

        // Send welcome email for influencers
        try {
          console.log("📧 Attempting to send welcome email to:", formData.email);
          const emailResult = await sendWelcomeEmail({
            email: formData.email,
            fullName: formData.fullName,
            isInfluencer: true,
            username: formData.socialHandle,
          });
          console.log("✅ Welcome email sent successfully:", emailResult);
          toast.success("Account created! Check your email for next steps and welcome information.");
        } catch (emailError) {
          console.error("❌ Failed to send welcome email:", emailError);
          // Don't block signup for email failure, but show a warning
          toast.success("Account created successfully! Welcome email may be delayed.");
        }
        
        console.log("🏠 Redirecting to home page");
        navigate("/");
      }
    } catch (error) {
      console.error("❌ Unexpected error during signup:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Your full name"
          required
          value={formData.fullName}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
      <UsernameInput
        id="socialHandle"
        label="Social Media Handle"
        placeholder="yourusername"
        value={formData.socialHandle}
        onChange={handleSocialHandleChange}
        disabled={isLoading}
      />
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder=""
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder=""
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={toggleConfirmPasswordVisibility}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
            <span className="sr-only">
              {showConfirmPassword ? "Hide password" : "Show password"}
            </span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="influencer-terms" 
          checked={formData.agreeToTerms}
          onCheckedChange={handleCheckboxChange}
          disabled={isLoading}
        />
        <label 
          htmlFor="influencer-terms" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the{' '}
          <Link 
            to="/terms" 
            className="text-brand-green hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link 
            to="/privacy" 
            className="text-brand-green hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
        </label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-brand-green hover:bg-brand-green/90 mt-4" 
        disabled={isLoading || isUsernameAvailable === false}
      >
        {isLoading ? "Creating Account..." : "Sign Up as Influencer"}
      </Button>
    </form>
  );
};

export default InfluencerSignupForm;
