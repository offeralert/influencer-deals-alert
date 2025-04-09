
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">About Offer Alert</CardTitle>
            <CardDescription>Connecting you with trusted influencer deals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">What is Offer Alert?</h3>
              <p className="text-muted-foreground">
                Offer Alert is a platform that connects users with exclusive deals and promo codes from their favorite influencers.
                We curate and verify all promotional offers to ensure you're getting genuine deals from trusted creators.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-muted-foreground">
                Our mission is to surface trusted affiliate deals from real influencers. We believe in transparency 
                and authenticity in the influencer marketing space, and we're committed to creating a platform 
                that benefits both consumers and content creators.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Supporting Creators</h3>
              <p className="text-muted-foreground">
                At Offer Alert, we ensure that influencers receive 100% of all commissions from their affiliate partnerships.
                We believe in fairly compensating creators for their work and influence, creating a sustainable ecosystem
                that rewards authentic content and genuine recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
