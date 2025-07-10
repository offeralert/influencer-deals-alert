
import React from "npm:react@18.3.1";

interface AgencyWelcomeEmailProps {
  fullName: string;
}

export const AgencyWelcomeEmail = ({ fullName }: AgencyWelcomeEmailProps) => {
  return (
    <html>
      <head>
        <style>
          {`
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #10b981;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .welcome-text {
              font-size: 18px;
              color: #4b5563;
              margin-bottom: 30px;
            }
            .features {
              background-color: #f0fdf4;
              border-left: 4px solid #10b981;
              padding: 20px;
              margin: 30px 0;
              border-radius: 0 8px 8px 0;
            }
            .features h3 {
              color: #065f46;
              margin-bottom: 15px;
              font-size: 18px;
            }
            .feature-list {
              list-style: none;
              padding: 0;
            }
            .feature-list li {
              padding: 8px 0;
              color: #374151;
              position: relative;
              padding-left: 25px;
            }
            .feature-list li:before {
              content: "✓";
              color: #10b981;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            .cta-button {
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              text-align: center;
            }
            .next-steps {
              background-color: #f9fafb;
              padding: 25px;
              border-radius: 8px;
              margin: 30px 0;
            }
            .next-steps h3 {
              color: #1f2937;
              margin-bottom: 15px;
            }
            .next-steps ol {
              color: #4b5563;
              padding-left: 20px;
            }
            .next-steps li {
              margin-bottom: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="logo">Offer Alert</div>
            <h1 className="title">Welcome to Offer Alert, {fullName}!</h1>
            <p className="welcome-text">
              You're now part of our exclusive agency network. Get ready to streamline your influencer management and maximize promotional opportunities.
            </p>
          </div>

          <div className="features">
            <h3>🚀 Your Agency Dashboard is Ready</h3>
            <ul className="feature-list">
              <li>Add and manage multiple influencers in your network</li>
              <li>Oversee promo codes and campaigns across your roster</li>
              <li>Streamlined onboarding process for new influencers</li>
              <li>Performance tracking and analytics for all campaigns</li>
              <li>Centralized management of brand partnerships</li>
            </ul>
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href="https://offeralert.io/agency-dashboard" className="cta-button">
              Access Your Agency Dashboard →
            </a>
          </div>

          <div className="next-steps">
            <h3>📋 Get Started in 3 Easy Steps:</h3>
            <ol>
              <li><strong>Access Your Dashboard:</strong> Click the button above to explore your agency control center</li>
              <li><strong>Add Your First Influencer:</strong> Use the "Add Influencer" tab to bring your team members into the platform</li>
              <li><strong>Start Managing Promo Codes:</strong> Help your influencers create and organize their promotional campaigns</li>
            </ol>
          </div>

          <div className="features">
            <h3>💡 Pro Tips for Agency Success:</h3>
            <ul className="feature-list">
              <li>Set up regular check-ins with your influencers to optimize performance</li>
              <li>Use our analytics to identify top-performing promo codes and brands</li>
              <li>Encourage your influencers to diversify across multiple brand categories</li>
              <li>Monitor expiration dates to ensure timely campaign updates</li>
            </ul>
          </div>

          <div className="footer">
            <p>
              <strong>Need Help?</strong><br/>
              Our team is here to support your agency's success. Visit our help center or contact us directly.
            </p>
            <p>
              Best regards,<br/>
              The Offer Alert Team
            </p>
            <p style={{ marginTop: '20px', fontSize: '12px' }}>
              This email was sent to you because you signed up as an agency partner with Offer Alert.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};
