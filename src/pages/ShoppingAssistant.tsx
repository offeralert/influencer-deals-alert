import ChatInterface from "@/components/chat/ChatInterface";

const ShoppingAssistant = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              Offer Alert Shopping Assistant
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get instant access to the best promo codes and deals. Just type a brand name or Instagram handle and I'll find the perfect offer for you!
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg shadow-sm h-[600px] flex flex-col">
            <ChatInterface />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t bg-muted/30 mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              💡 <strong>Pro tip:</strong> Try searching with brand names like "Nike" or Instagram handles like "@morninglavender"
            </p>
            <p>
              Your chat session is private and temporary - it resets when you leave the page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingAssistant;