
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface InfluencerCredentials {
  id: string;
  email: string;
  temporary_password: string;
  full_name: string;
  username: string;
}

interface InfluencerCredentialsModalProps {
  open: boolean;
  onClose: () => void;
  credentials: InfluencerCredentials | null;
}

const InfluencerCredentialsModal = ({ open, onClose, credentials }: InfluencerCredentialsModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${label} has been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const copyAllCredentials = async () => {
    if (!credentials) return;
    
    const credentialText = `Influencer Login Credentials
    
Name: ${credentials.full_name}
Username: ${credentials.username}
Email: ${credentials.email}
Temporary Password: ${credentials.temporary_password}

Please log in at your earliest convenience and change your password.`;

    await copyToClipboard(credentialText, "All credentials");
  };

  if (!credentials) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Influencer Created Successfully
          </DialogTitle>
          <DialogDescription>
            Share these login credentials with {credentials.full_name}.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 rounded border text-sm">
                  {credentials.full_name}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.full_name, "Name")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 rounded border text-sm">
                  {credentials.username}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.username, "Username")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 rounded border text-sm">
                  {credentials.email}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.email, "Email")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Temporary Password</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                  {showPassword ? credentials.temporary_password : "••••••••••"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.temporary_password, "Password")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Next steps:</strong> Share these credentials with the influencer so they can log in. 
            They should change their password after first login for security.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={copyAllCredentials}
            className="flex-1 bg-purple-600 hover:bg-purple-600/90"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy All Credentials
          </Button>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfluencerCredentialsModal;
