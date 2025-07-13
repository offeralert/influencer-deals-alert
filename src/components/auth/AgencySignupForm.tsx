
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
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";

const AgencySignupForm = () => {
  const navigate = useNavigate();
  const { track } = useMetaTracking();
  const { refreshProfile, setJustSignedUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    agencyName: "",
    contactEmail: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  // Generate username from agency name
  const generatedUsername = formData.agencyName.toLowerCase().replace(/\s+/g, '_');
  const { isAvailable: isUsernameAvailable } = useUsernameAvailability(generatedUsername);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      toast.error("An agency with this name already exists. Please choose a different name.");
      return;
    }

    if (isUsernameAvailable === null && generatedUsername) {
      toast.error("Please wait while we check agency name availability");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("🚀 Starting agency signup process for:", formData.contactEmail);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.contactEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.agencyName,
            username: generatedUsername,
          },
        },
      });

      if (error) {
        console.error("❌ Signup error:", error);
        
        // Handle specific username constraint error
        if (error.message.includes('profiles_username_key') || error.message.includes('duplicate key')) {
          toast.error("An agency with this name already exists. Please choose a different name.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        console.log("✅ User created successfully:", data.user.id);
        
        // Update the profile to set is_agency to true
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_agency: true })
          .eq('id', data.user.id);

        if (profileError) {
          console.error("❌ Error updating profile:", profileError);
          
          // Handle specific username constraint error in profile update
          if (profileError.message.includes('profiles_username_key') || profileError.message.includes('duplicate key')) {
            toast.error("An agency with this name already exists. Please try signing up with a different agency name.");
          } else {
            toast.error("Account created but agency status couldn't be updated");
          }
          return;
        }
        
        console.log("✅ Profile updated to agency successfully");
        
        // Set flag to indicate fresh signup
        setJustSignedUp(true);
        
        // Refresh the profile in auth context to ensure latest data
        console.log("🔄 Refreshing profile in auth context...");
        await refreshProfile();
        
        // Add a small delay to ensure profile state is fully updated
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("✅ Profile refreshed in auth context");
        
        // Track successful agency signup with Meta
        try {
          await track('AgencySignup', createLeadPayload({
            content_name: 'agency_registration',
            content_category: 'agency_signup',
            lead_type: 'agency_application',
            value: 0
          }));
          console.log("✅ Meta tracking event sent");
        } catch (trackingError) {
          console.error("❌ Meta tracking failed:", trackingError);
          // Don't block signup for tracking failure
        }

        // Send welcome email for agencies
        try {
          console.log("📧 Attempting to send agency welcome email to:", formData.contactEmail);
          const emailResult = await sendWelcomeEmail({
            email: formData.contactEmail,
            fullName: formData.agencyName,
            isInfluencer: false,
            isAgency: true,
            username: generatedUsername,
          });
          console.log("✅ Agency welcome email sent successfully:", emailResult);
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

  const getUsernameFeedback = () => {
    if (!generatedUsername) return null;
    
    if (isUsernameAvailable === false) {
      return <span className="text-xs text-destructive">An agency with this name already exists</span>;
    }
    
    if (isUsernameAvailable === true) {
      return <span className="text-xs text-green-600">Agency name is available</span>;
    }
    
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="agencyName">Agency Name</Label>
        <Input
          id="agencyName"
          name="agencyName"
          placeholder="Your agency name"
          required
          value={formData.agencyName}
          onChange={handleChange}
          disabled={isLoading}
        />
        {getUsernameFeedback()}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          placeholder="contact@youragency.com"
          required
          value={formData.contactEmail}
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
          id="agency-terms" 
          checked={formData.agreeToTerms}
          onCheckedChange={handleCheckboxChange}
          disabled={isLoading}
        />
        <label 
          htmlFor="agency-terms" 
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
        {isLoading ? "Creating Account..." : "Sign Up as Agency"}
      </Button>
    </form>
  );
};

export default AgencySignupForm;
