import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface InfluencerWelcomeEmailProps {
  fullName: string;
  username: string;
}

export const InfluencerWelcomeEmail = ({ fullName, username }: InfluencerWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Offer Alert - Start earning with your influence!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Offer Alert, {fullName}! 🚀</Heading>
        
        <Text style={text}>
          Congratulations on joining Offer Alert as an influencer! You're now part of an exclusive community that's revolutionizing how people discover and save with promo codes.
        </Text>

        <Section style={section}>
          <Heading style={h2}>Your Next Steps to Success 📈</Heading>
          
          <div style={step}>
            <Text style={stepTitle}>1. Set Up Your Dashboard</Text>
            <Text style={stepText}>
              Access your influencer dashboard to add your first promo codes and start earning.
            </Text>
            <Button
              style={button}
              href="https://offeralert.io/influencer-dashboard?utm_source=welcome-email"
            >
              🎯 Go to Dashboard
            </Button>
          </div>

          <div style={step}>
            <Text style={stepTitle}>2. Download the Browser Extension</Text>
            <Text style={stepText}>
              Get the extension to see how your followers will discover your deals.
            </Text>
            <Button
              style={buttonSecondary}
              href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=welcome-email"
            >
              📥 Download Extension
            </Button>
          </div>

          <div style={step}>
            <Text style={stepTitle}>3. Share Your Profile</Text>
            <Text style={stepText}>
              Share your unique profile link with followers so they can follow you and get your exclusive deals.
            </Text>
            <Button
              style={buttonSecondary}
              href={`https://offeralert.io/influencer/${username}?utm_source=welcome-email`}
            >
              🔗 View Your Profile
            </Button>
          </div>
        </Section>

        <Section style={proTipSection}>
          <Heading style={h3}>💡 Pro Tips for Success:</Heading>
          <Text style={listItem}>✅ Add 1-3 promo codes to start - quality over quantity drives engagement</Text>
          <Text style={listItem}>✅ Share your profile link in your bio and stories</Text>
          <Text style={listItem}>✅ Update your codes regularly to keep followers engaged</Text>
          <Text style={listItem}>✅ Use the browser extension to discover trending deals in your niche</Text>
        </Section>

        <Text style={text}>
          Ready to turn your influence into income? Let's get started! 🎉
        </Text>

        <Text style={footer}>
          Welcome to the team! 🙌<br />
          The Offer Alert Team
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const h1 = {
  color: "#333",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  lineHeight: "42px",
};

const h2 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "30px 0 15px",
};

const h3 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "25px 0 15px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const listItem = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "8px 0",
};

const button = {
  backgroundColor: "#22c55e",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px 32px",
  margin: "16px 0",
};

const buttonSecondary = {
  backgroundColor: "#6b7280",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "12px 0",
};

const section = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
};

const proTipSection = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  border: "1px solid #fbbf24",
};

const step = {
  marginBottom: "24px",
  paddingBottom: "16px",
  borderBottom: "1px solid #e5e7eb",
};

const stepTitle = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const stepText = {
  color: "#666",
  fontSize: "14px",
  margin: "0 0 12px",
  lineHeight: "20px",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  marginTop: "32px",
};
