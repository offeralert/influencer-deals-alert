
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

interface UserWelcomeEmailProps {
  fullName: string;
}

export const UserWelcomeEmail = ({ fullName }: UserWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Offer Alert - Start saving instantly!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Offer Alert! 🎉</Heading>
        
        <Text style={text}>Hi {fullName},</Text>
        
        <Text style={text}>
          Welcome to Offer Alert! We're thrilled to have you join our community of smart shoppers who never miss a deal.
        </Text>

        <Section style={section}>
          <Heading style={h2}>Get Started in 30 Seconds ⚡</Heading>
          <Text style={text}>
            Download our browser extension to start receiving instant notifications about exclusive promo codes and deals while you shop online.
          </Text>
          
          <Button
            style={button}
            href="https://chromewebstore.google.com/detail/bpbafccmoldgaecdefhjfmmandfgblfk?utm_source=welcome-email"
          >
            📥 Download Browser Extension
          </Button>
        </Section>

        <Section style={section}>
          <Heading style={h3}>What You'll Get:</Heading>
          <Text style={listItem}>✅ Instant promo code notifications while shopping</Text>
          <Text style={listItem}>✅ Access to exclusive influencer deals</Text>
          <Text style={listItem}>✅ Never miss a discount again</Text>
          <Text style={listItem}>✅ Follow your favorite influencers for their latest offers</Text>
        </Section>

        <Text style={text}>
          Have questions? Reply to this email and our team will help you get started!
        </Text>

        <Text style={footer}>
          Happy saving! 💰<br />
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
  margin: "24px 0",
};

const section = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  marginTop: "32px",
};
