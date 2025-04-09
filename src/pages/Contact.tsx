
import { Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Contact Us</CardTitle>
            <CardDescription>We'd love to hear from you!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base text-muted-foreground">
              For any questions, feedback, or partnership inquiries, reach out to us at hello@offeralert.io.
            </p>
            <div className="flex items-center justify-center p-6">
              <a 
                href="mailto:hello@offeralert.io"
                className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-3 rounded-md transition-colors"
              >
                <Mail size={20} />
                <span>Email Us</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
