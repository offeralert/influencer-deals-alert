import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Unsubscribe() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const { toast } = useToast();

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Insert into unsubscribed_emails table (we'll create this)
      const { error } = await supabase
        .from('unsubscribed_emails')
        .insert([{ email: email.toLowerCase().trim() }])
        .select();

      if (error && error.code !== '23505') { // 23505 is unique constraint violation (already unsubscribed)
        throw error;
      }

      setIsUnsubscribed(true);
      toast({
        title: "Successfully unsubscribed",
        description: "You will no longer receive marketing emails from us.",
      });
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast({
        title: "Error",
        description: "There was an issue processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUnsubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Unsubscribed Successfully</CardTitle>
            <CardDescription>
              You have been removed from our mailing list and will no longer receive marketing emails from us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              If you change your mind, you can always sign up again on our website.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Unsubscribe</CardTitle>
          <CardDescription>
            We're sorry to see you go. Enter your email address below to unsubscribe from our mailing list.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Unsubscribing..." : "Unsubscribe"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            This will only unsubscribe you from marketing emails. You may still receive important account-related notifications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}