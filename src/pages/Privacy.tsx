
const Privacy = () => {
  const lastUpdated = "January 12, 2025";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>
        
        <div className="prose dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4">
              Welcome to Offer Alert. We respect your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
              our website, mobile application, and services, including our Instagram Direct Message service.
            </p>
            <p className="mb-4">
              By using Offer Alert, you agree to the collection and use of information in accordance with this policy. 
              If you disagree with any part of this privacy policy, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Name and email address when you create an account</li>
              <li>Username and profile information</li>
              <li>Avatar/profile pictures you upload</li>
              <li>Payment information processed through Stripe</li>
              <li>Communication preferences and subscription settings</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">User-Generated Content</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Promo codes and discount information you create or share</li>
              <li>Brand partnership details and affiliate links</li>
              <li>Profile descriptions and social media handles</li>
              <li>Reviews and ratings of deals or influencers</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Instagram Interaction Data</h3>
            <p className="mb-3">
              When you interact with our Instagram Direct Message service, we collect and process:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Your Instagram user ID and username</li>
              <li>Messages you send to our Instagram account</li>
              <li>Shared Instagram posts and media you send us</li>
              <li>Timestamp and interaction data for service improvement</li>
              <li>Brand handles and URLs extracted from shared content</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Technical Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Usage patterns and navigation data</li>
              <li>Error logs and diagnostic information</li>
            </ul>
          </section>

          {/* Instagram DM Service */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Instagram Direct Message Service</h2>
            <p className="mb-4">
              <strong>Our Instagram DM bot provides automated promo code recommendations.</strong> Here's how it works:
            </p>
            
            <h3 className="text-xl font-medium mb-3">How the Service Works</h3>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>You send a message to our Instagram account with a brand's Instagram handle (e.g., @nike) or share an Instagram post</li>
              <li>Our system automatically processes your message using Instagram's Graph API</li>
              <li>We extract brand information and search our database for relevant promo codes</li>
              <li>We send you an automated response with available deals and discount codes</li>
            </ol>

            <h3 className="text-xl font-medium mb-3">Data Processing for Instagram DM</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li><strong>Message Analysis:</strong> We analyze your messages to identify brand mentions and extract Instagram handles</li>
              <li><strong>Shared Content Processing:</strong> When you share Instagram posts, we access public post data to identify the brand</li>
              <li><strong>Database Matching:</strong> We match identified brands with our promo code database</li>
              <li><strong>Automated Responses:</strong> We send personalized responses with relevant offers</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Consent and Control</h3>
            <p className="mb-4">
              <strong>By messaging our Instagram account, you consent to automated processing of your messages.</strong> 
              You can stop using the service at any time by not sending messages to our Instagram account.
            </p>

            <h3 className="text-xl font-medium mb-3">Message Logging and Retention</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>We log Instagram interactions for debugging and service improvement</li>
              <li>Message logs are retained for 90 days unless legally required otherwise</li>
              <li>Personal identifiers in logs are pseudonymized where possible</li>
              <li>You can request deletion of your Instagram interaction data</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for the following purposes:</p>
            
            <h3 className="text-xl font-medium mb-3">Service Provision</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Provide promo code recommendations via Instagram DM and web platform</li>
              <li>Manage your account, profile, and preferences</li>
              <li>Process payments and manage subscriptions</li>
              <li>Connect users with relevant influencers and brands</li>
              <li>Send welcome emails and service notifications</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Communication</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Send you updates about new features and services</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send transactional emails (account confirmations, password resets)</li>
              <li>Notify you about important changes to our services</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Analytics and Improvement</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Analyze usage patterns to improve our services</li>
              <li>Monitor and debug technical issues</li>
              <li>Develop new features and functionality</li>
              <li>Measure the effectiveness of our Instagram DM service</li>
            </ul>
          </section>

          {/* Data Sharing and Third Parties */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Sharing and Third Parties</h2>
            <p className="mb-4">
              We do not sell your personal information. We may share your information with the following third parties:
            </p>

            <h3 className="text-xl font-medium mb-3">Essential Service Providers</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Instagram/Meta:</strong> For Instagram DM functionality through their Graph API</li>
              <li><strong>Stripe:</strong> For payment processing and subscription management</li>
              <li><strong>Resend:</strong> For sending transactional and welcome emails</li>
              <li><strong>Supabase:</strong> For database hosting and authentication services</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Legal Requirements</h3>
            <p className="mb-4">
              We may disclose your information if required by law, court order, or government request, 
              or to protect our rights, property, or safety.
            </p>

            <h3 className="text-xl font-medium mb-3">Business Transfers</h3>
            <p className="mb-4">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred 
              as part of that transaction.
            </p>
          </section>

          {/* Data Security and International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security and International Transfers</h2>
            
            <h3 className="text-xl font-medium mb-3">Security Measures</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Data encryption in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and monitoring</li>
              <li>Compliance with industry security standards</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">International Data Transfers</h3>
            <p className="mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place for international transfers.
            </p>

            <h3 className="text-xl font-medium mb-3">Data Retention</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Account data: Retained until account deletion</li>
              <li>Instagram DM logs: 90 days unless legally required otherwise</li>
              <li>Payment records: As required by financial regulations</li>
              <li>Analytics data: Aggregated and anonymized after 2 years</li>
            </ul>
          </section>

          {/* Your Rights and Choices */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
            
            <h3 className="text-xl font-medium mb-3">Access and Control</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li><strong>Account Access:</strong> View and edit your profile information</li>
              <li><strong>Data Portability:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Communication Preferences</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Unsubscribe from promotional emails</li>
              <li>Opt out of Instagram DM service by not messaging our account</li>
              <li>Manage notification settings in your account preferences</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Cookie Management</h3>
            <p className="mb-4">
              You can control cookies through your browser settings. Note that disabling cookies may 
              affect the functionality of our services.
            </p>
          </section>

          {/* Legal Compliance */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Legal Compliance</h2>
            
            <h3 className="text-xl font-medium mb-3">GDPR (European Users)</h3>
            <p className="mb-4">
              If you are located in the European Economic Area, you have additional rights under the 
              General Data Protection Regulation, including the right to object to processing and 
              lodge complaints with supervisory authorities.
            </p>

            <h3 className="text-xl font-medium mb-3">CCPA (California Residents)</h3>
            <p className="mb-4">
              California residents have specific rights regarding their personal information, including 
              the right to know what information is collected and the right to delete personal information.
            </p>

            <h3 className="text-xl font-medium mb-3">Children's Privacy (COPPA)</h3>
            <p className="mb-4">
              Our services are not intended for children under 13. We do not knowingly collect personal 
              information from children under 13. If we become aware of such collection, we will delete 
              the information immediately.
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar technologies to enhance user experience, monitor activity, 
              and analyze website performance. Types of cookies we use include:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our site</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
            <p className="mb-4">
              You can manage cookie settings in your browser. Disabling certain cookies may limit website functionality.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Posting the updated policy on our website</li>
              <li>Sending email notifications to registered users</li>
              <li>Updating the "Last Updated" date at the top of this policy</li>
            </ul>
            <p className="mb-4">
              Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:hello@offeralert.io" className="text-brand-green hover:underline">
                  hello@offeralert.io
                </a>
              </p>
              <p className="mb-2">
                <strong>Subject Line:</strong> Privacy Policy Inquiry
              </p>
              <p>
                <strong>Response Time:</strong> We aim to respond to privacy inquiries within 30 days
              </p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
            <p className="mb-4">
              This Privacy Policy is governed by the laws of the jurisdiction where Offer Alert is incorporated. 
              Any disputes arising from this policy will be resolved through binding arbitration or in the 
              appropriate courts of that jurisdiction.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
