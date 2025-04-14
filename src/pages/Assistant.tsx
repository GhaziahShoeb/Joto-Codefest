import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Loader2, Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

const Assistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm your AI study assistant. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateContent, isLoading } = useAIAssistant();
  const { toast } = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Check if API key exists
    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        content: "You need to add your Gemini API key in Settings before using the assistant.",
        role: "assistant",
        timestamp: new Date(),
      }]);
      return;
    }

    try {
      const response = await generateContent({
        prompt: input,
        temperature: 0.7,
        maxTokens: 1000,
      });
      
      if (response) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: response,
          role: "assistant",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      // Error handling is done in the hook, so we just add a generic error message here
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: "I'm sorry, I encountered an error when processing your request.",
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">Get help with your studies</p>
      </div>

      <Card className="h-[calc(100vh-220px)] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Chat with Joto AI
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[80%]",
                message.role === "assistant" ? "self-start" : "self-end ml-auto"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Brain className="h-5 w-5" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg p-3",
                  message.role === "assistant"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="p-4 border-t">
          <div className="flex w-full items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or get help with your notes..."
              className="min-h-10 flex-1 resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              size="icon" 
              className="h-10 w-10 rounded-full"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Assistant;
