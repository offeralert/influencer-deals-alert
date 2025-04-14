
const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert">
          <p className="mb-6">
            Offer Alert respects your privacy. We collect limited personal information (like name and email) when you sign up. We don't sell or share your personal data.
          </p>
          
          <p className="mb-6">
            We use cookies to enhance user experience and monitor activity. You can manage cookie settings in your browser.
          </p>
          
          <p className="mb-6">
            By using Offer Alert, you agree to this Privacy Policy. Questions? Contact us at{' '}
            <a href="mailto:hello@offeralert.io" className="text-brand-green hover:underline">
              hello@offeralert.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
