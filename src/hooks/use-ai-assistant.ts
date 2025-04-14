import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface GenerateOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export function useAIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateContent = async (options: GenerateOptions): Promise<string> => {
    const { prompt, temperature = 0.7, maxTokens = 2000 } = options;
    
    setIsLoading(true);
    
    try {
      const apiKey = localStorage.getItem('gemini-api-key');
      if (!apiKey) {
        throw new Error("API key not found. Please add your Gemini API key in Settings.");
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: 0.8,
            topK: 40,
          },
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "API request failed");
      }
      
      const data = await response.json();
      
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      toast({
        title: "AI Error",
        description: error instanceof Error ? error.message : "An error occurred while generating content",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateContent, isLoading };
}
