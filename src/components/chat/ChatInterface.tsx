import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, [sessionId]);

  const loadConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('web_chat_sessions')
        .select('role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading conversation history:', error);
        return;
      }

      const historyMessages = data?.map(row => ({
        role: row.role as 'user' | 'assistant',
        content: row.content,
        timestamp: new Date(row.created_at)
      })) || [];

      setMessages(historyMessages);

      // Show welcome message if no history
      if (historyMessages.length === 0) {
        const welcomeMessage: Message = {
          role: 'assistant',
          content: "Hey! I'm your OfferAlert shopping assistant! 😊 I help you find the best promo codes and deals. Share a brand name or @handle and I'll hunt down the best deals for you!",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (isLoading) return;

    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the web chat assistant function
      const { data, error } = await supabase.functions.invoke('web-chat-assistant', {
        body: {
          sessionId,
          message: messageContent
        }
      });

      if (error) {
        throw error;
      }

      // If we got an updated conversation, use that
      if (data?.conversation) {
        const conversationMessages = data.conversation.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date() // We could parse the actual timestamp if needed
        }));
        setMessages(conversationMessages);
      } else if (data?.response) {
        // Otherwise just add the response
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Please try again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">OfferAlert Assistant</h2>
          <p className="text-sm text-muted-foreground">Find the best deals and promo codes</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg rounded-bl-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={sendMessage}
        disabled={isLoading}
        placeholder="Try '@nike' or 'Morning Lavender'..."
      />
    </div>
  );
};

export default ChatInterface;
