// AI Service implementation

export interface AIGenerateOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  model?: string;
}

// Get API key from localStorage
const getApiKey = (): string | null => {
  return localStorage.getItem('gemini-api-key');
};

export const aiService = {
  generateContent: async (options: AIGenerateOptions): Promise<any> => {
    const { prompt, temperature = 0.7, maxTokens, model = "gemini-2.0-flash" } = options;
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error("Gemini API key not configured. Please add your API key in Settings.");
    }
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens || 800,
            topP: options.topP || 0.95,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  },

  /**
   * Enhanced text beautification function
   * @param text The text to enhance
   * @param instruction Instructions for the enhancement
   * @returns The enhanced text
   */
  enhanceText: async (text: string, instruction: string): Promise<string> => {
    try {
      const prompt = `${instruction}\n\nText to enhance:\n${text}`;
      const result = await aiService.generateContent({
        prompt,
        temperature: 0.3,  // Lower temperature for more consistent, focused responses
        maxTokens: 1500,   // Allow for longer content to be processed
        topP: 0.95         // Higher topP to encourage more creative enhancements
      });
      
      return result as string;
    } catch (error) {
      console.error("Error enhancing text:", error);
      throw new Error("Failed to enhance text with AI");
    }
  },

  testConnection: async (): Promise<boolean> => {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }
    } catch (error) {
      console.error("API connection test failed:", error);
      throw error;
    }
  },

  generateFlashcards: async (text: string, style: string, difficulty: string, count: number = 10): Promise<any> => {
    const prompt = `Create ${count} flashcards based on the ACADEMIC CONTENT in the text provided below.

IMPORTANT: 
- Focus ONLY on factual information from the provided text
- DO NOT create flashcards about flashcards, UI elements, or the application itself
- DO NOT create flashcards that explain what a "flashcard" is or how to use the editor
- Each flashcard must be directly based on subject matter contained in the text
- The front should contain a clear concept, term, or question from the text
- The back should contain the definition, explanation, or answer from the text
- Use ${style} style format and ${difficulty} difficulty level

FORMAT YOUR RESPONSE AS JSON ARRAY:
[
  {"front": "Term or concept from text", "back": "Definition or explanation from text"},
  {"front": "Question about text content", "back": "Answer from the text"},
  ...
]

TEXT TO ANALYZE AND EXTRACT INFORMATION FROM:
${text}`;
    
    try {
      const result = await aiService.generateContent({
        prompt,
        temperature: 0.2, // Lower temperature for more factual content
        maxTokens: Math.max(2000, count * 100), // Scale token limit based on requested cards
        model: "gemini-2.0-flash"
      });
      
      // Process the result to ensure we get valid JSON
      if (typeof result === 'string') {
        // Find anything that looks like a JSON array in the response
        const startIdx = result.indexOf('[');
        const endIdx = result.lastIndexOf(']');
        
        if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
          throw new Error("Invalid response format: No JSON array found");
        }
        
        const jsonString = result.substring(startIdx, endIdx + 1).trim();
        
        try {
          const parsedCards = JSON.parse(jsonString);
          // Verify we have the right number of cards or at least some cards
          if (parsedCards.length === 0) {
            throw new Error("No flashcards were generated");
          }
          
          // Return the parsed cards, limited to the requested count
          return parsedCards.slice(0, count);
        } catch (error) {
          // Try to clean up the JSON by removing any markdown or comments
          const cleanedJson = jsonString
            .replace(/```(json|javascript)?|```/g, '')
            .replace(/\/\/.*|\/\*[\s\S]*?\*\//gm, '')
            .replace(/\\"/g, '"')        // Fix escaped quotes
            .replace(/\\n/g, ' ')        // Replace newlines with spaces
            .trim();
          
          try {
            const parsedCards = JSON.parse(cleanedJson);
            return parsedCards.slice(0, count);
          } catch (fallbackError) {
            console.error("Failed to parse flashcards:", fallbackError);
            console.log("Raw response:", result);
            console.log("Attempted to parse:", cleanedJson);
            throw new Error("Could not parse the flashcard data from AI response");
          }
        }
      }
      
      // If result is already an array, return it
      return Array.isArray(result) ? result.slice(0, count) : result;
    } catch (error) {
      console.error("Error generating flashcards:", error);
      throw error;
    }
  },

  generateQuestions: async (
    text: string, 
    type: string, 
    difficulty: string,
    count: number = 5,
    context?: string
  ): Promise<any> => {
    // Add context information to the prompt if provided
    const contextInfo = context ? 
      `Context: ${context}\n\n` : 
      "";
    
    const prompt = `${contextInfo}Create ${count} ${type} questions based on the following content. 
    Each question should test understanding of key concepts in the text.
    Make sure each question has a clear answer that can be found in the text.
    Difficulty level: ${difficulty}.
    
    ${context ? `Use the provided context to tailor questions appropriately for this subject and audience.` : ''}
    
    Format the response as a valid JSON array with the following structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "The correct option here",
        "explanation": "Brief explanation of the answer"
      }
    ]
    
    If the question type is not multiple choice, then format it as:
    [
      {
        "question": "Question text here?",
        "correctAnswer": "The correct answer here",
        "explanation": "Brief explanation of the answer"
      }
    ]
    
    The content to base questions on is:
    ${text}`;
    
    try {
      const result = await aiService.generateContent({
        prompt,
        temperature: 0.4,
        maxTokens: 2500,
        model: "gemini-2.0-flash"
      });
      
      // Process the result to ensure we get valid JSON
      if (typeof result === 'string') {
        // Find anything that looks like a JSON array in the response
        const startIdx = result.indexOf('[');
        const endIdx = result.lastIndexOf(']');
        
        if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
          throw new Error("Invalid response format: No JSON array found");
        }
        
        const jsonString = result.substring(startIdx, endIdx + 1).trim();
        
        try {
          const parsedQuestions = JSON.parse(jsonString);
          // Verify we have valid questions
          if (parsedQuestions.length === 0) {
            throw new Error("No questions were generated");
          }
          
          return parsedQuestions;
        } catch (error) {
          // Try to clean up the JSON
          const cleanedJson = jsonString
            .replace(/```(json|javascript)?|```/g, '')
            .replace(/\/\/.*|\/\*[\s\S]*?\*\//gm, '')
            .replace(/\\"/g, '"')
            .replace(/\\n/g, ' ')
            .trim();
          
          try {
            return JSON.parse(cleanedJson);
          } catch (fallbackError) {
            console.error("Failed to parse questions:", fallbackError);
            throw new Error("Could not parse the question data from AI response");
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  }
};
