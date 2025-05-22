
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

// Helper function to track Meta Pixel events
const trackMetaEvent = (eventName: string, params?: Record<string, any>) => {
  if (window.fbq) {
    window.fbq('track', eventName, params);
    console.log(`Meta Pixel event tracked: ${eventName}`, params);
  } else {
    console.warn('Meta Pixel not loaded. Event not tracked:', eventName);
  }
};

const InfluencerSignupForm = () => {
  const navigate = useNavigate();
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
    
    setIsLoading(true);
    
    try {
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
        toast.error(error.message);
        console.error("Signup error:", error);
        return;
      }

      if (data.user) {
        // Update the profile to set is_influencer to true, without trying to set application_date
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ is_influencer: true })
          .eq('id', data.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          toast.error("Account created but influencer status couldn't be updated");
          return;
        }
        
        // Track successful influencer signup with Meta Pixel
        trackMetaEvent('InfluencerSignup', {
          content_name: 'influencer_registration',
          status: 'complete',
          user_data: {
            email_hashed: true // Meta will automatically hash the email if present in the page
          }
        });
      }

      toast.success("Signup successful! You can now log in as an influencer.");
      navigate("/login");
    } catch (error) {
      console.error("Unexpected error during application:", error);
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
      
      <div className="space-y-2">
        <Label htmlFor="socialHandle">Social Media Handle</Label>
        <Input
          id="socialHandle"
          name="socialHandle"
          placeholder="@yourusername"
          required
          value={formData.socialHandle}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>
      
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
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Sign Up as Influencer"}
      </Button>
    </form>
  );
};

export default InfluencerSignupForm;
