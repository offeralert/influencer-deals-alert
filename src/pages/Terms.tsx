
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Terms of Service for Offer Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h3>
              <p className="text-muted-foreground">
                By accessing or using Offer Alert's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">2. Description of Service</h3>
              <p className="text-muted-foreground">
                Offer Alert provides a platform where users can discover and access promotional offers and discount codes from influencers. We do not guarantee the availability or validity of any offers listed on our platform.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">3. User Accounts</h3>
              <p className="text-muted-foreground">
                You may need to create an account to access certain features of our service. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">4. User Conduct</h3>
              <p className="text-muted-foreground">
                You agree not to use our service for any unlawful purpose or in any way that could damage, disable, or impair our service. You also agree not to attempt to gain unauthorized access to any part of our service.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">5. Intellectual Property</h3>
              <p className="text-muted-foreground">
                All content, features, and functionality on our service are owned by Offer Alert and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">6. Disclaimer of Warranties</h3>
              <p className="text-muted-foreground">
                Our service is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that our service will be uninterrupted, timely, secure, or error-free.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">7. Limitation of Liability</h3>
              <p className="text-muted-foreground">
                Offer Alert will not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our service.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">8. Changes to Terms</h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms of Service at any time. We will provide notice of significant changes by posting the new Terms on our service.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">9. Governing Law</h3>
              <p className="text-muted-foreground">
                These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which Offer Alert operates.
              </p>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground italic">
                Last updated: April 9, 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
