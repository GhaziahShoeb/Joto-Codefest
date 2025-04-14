import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Sparkles, X, BookOpen, HelpCircle, Brain, 
  Link, Youtube, Video, Edit, ExternalLink, Copy, 
  ClipboardPaste, FileText, PlusCircle, CheckCircle
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIAssistantButtonProps {
  currentNote: string;
  selectedText: string;
  onApplyEdit: (newText: string) => void;
  references?: any[];
  onAddToNotes?: (content: string, title?: string) => void;
}

export function AIAssistantButton({ 
  currentNote = "", 
  selectedText = "", 
  onApplyEdit = (newText: string) => {}, 
  references = [],
  onAddToNotes
}: AIAssistantButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAddedToNotes, setIsAddedToNotes] = useState(false);
  const [generateNotesTopicInput, setGenerateNotesTopicInput] = useState("");
  const [referenceContextEnabled, setReferenceContextEnabled] = useState(true);
  const { generateContent, isLoading } = useAIAssistant();
  const { toast } = useToast();
  
  // Predefined prompts for better UX
  const predefinedPrompts = [
    { icon: Edit, text: "Improve this note", prompt: "Improve this note by fixing grammar, enhancing clarity, and adding structure" },
    { icon: BookOpen, text: "Summarize", prompt: "Summarize the key points in this note concisely" },
    { icon: Brain, text: "Explain this concept", prompt: "Explain this concept in simpler terms with examples" },
    { icon: HelpCircle, text: "Help me prepare", prompt: "Help me prepare for an exam on this topic with key questions" },
    { icon: FileText, text: "Generate notes", prompt: "Generate comprehensive study notes on this topic" }
  ];

  // Listen for notes context updates and set up enhancement prompts
  useEffect(() => {
    if (selectedText) {
      setEditedText(selectedText);
    }
  }, [selectedText]);

  // Reset copy/add states when response changes
  useEffect(() => {
    if (response) {
      setShowActionButtons(true);
      setIsCopied(false);
      setIsAddedToNotes(false);
    } else {
      setShowActionButtons(false);
    }
  }, [response]);

  const handleAssistantRequest = async () => {
    if (!prompt.trim()) return;
    
    setResponse("");
    setEditMode(false);
    
    try {
      // Prepare context for the AI to work with
      const context = selectedText || currentNote || "";
      
      // Add reference context if available and enabled
      let referenceContext = "";
      if (referenceContextEnabled && references && references.length > 0) {
        referenceContext = "\n\nRelevant reference materials:\n" + 
          references.map((ref, index) => {
            return `${index + 1}. ${ref.title} - ${ref.description || 'No description available'} ${ref.url ? '(Source: ' + ref.url + ')' : ''}`;
          }).join("\n");
      }
      
      const contextPrompt = context 
        ? `Based on the following content:${referenceContext}\n\n${context}\n\n${prompt}`
        : prompt;
      
      const result = await generateContent({
        prompt: contextPrompt,
        temperature: 0.7,
        maxTokens: 1200
      });
      
      if (result) {
        setResponse(result);
      }
    } catch (error) {
      // Error is already handled in the hook
      setResponse("Sorry, I couldn't process your request at this time.");
    }
  };

  const handlePredefinedPrompt = (promptText: string) => {
    setPrompt(promptText);
    if (!isLoading) {
      handleAssistantRequest();
    }
  };

  const handleEnhanceNotes = () => {
    const enhancementPrompt = "Please improve the following notes by adding structure, clarifying concepts, and formatting for better readability. Return the result as markdown.";
    setPrompt(enhancementPrompt);
    setEditMode(true);
    handleAssistantRequest();
  };

  const handleGenerateNotes = async () => {
    if (!generateNotesTopicInput.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic to generate notes about",
        variant: "destructive"
      });
      return;
    }

    setResponse("");
    setIsAddedToNotes(false);
    setIsCopied(false);
    
    // Add reference context if available and enabled
    let referenceContext = "";
    if (referenceContextEnabled && references && references.length > 0) {
      referenceContext = "\n\nIncorporate information from these reference materials:\n" + 
        references.map((ref, index) => {
          return `${index + 1}. ${ref.title} - ${ref.description || 'No description available'} ${ref.url ? '(Source: ' + ref.url + ')' : ''}`;
        }).join("\n");
    }

    try {
      const prompt = `Generate comprehensive and well-structured study notes about "${generateNotesTopicInput}".
      Include key concepts, definitions, examples, and explanations.
      Organize the content with clear headings and bullet points where appropriate.
      Format the response using markdown.${referenceContext}`;

      const result = await generateContent({
        prompt,
        temperature: 0.5,
        maxTokens: 2000
      });
      
      if (result) {
        setResponse(result);
        setActiveTab("notes");
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate notes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleApplyEdit = () => {
    if (!response) return;
    
    onApplyEdit(response);
    toast({
      title: "Applied edits",
      description: "The AI suggestions have been applied to your note",
    });
    setResponse("");
    setEditMode(false);
  };

  const handleCopyToClipboard = () => {
    if (!response) return;
    
    navigator.clipboard.writeText(response);
    setIsCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard"
    });
    
    // Reset copied state after 3 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleAddToNotes = () => {
    if (!response || !onAddToNotes) return;
    
    // Extract a title from the first line if possible
    const lines = response.split('\n');
    let title = '';
    let content = response;
    
    // Look for a title in markdown format (# Title)
    const titleMatch = lines[0].match(/^#\s+(.+)$/);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1];
    } else if (lines[0].length < 50) {
      // Use the first line as title if it's short enough
      title = lines[0];
    } else {
      // Default title based on the first few words
      title = `Notes on ${generateNotesTopicInput || 'AI Assistant response'}`;
    }
    
    onAddToNotes(content, title);
    setIsAddedToNotes(true);
    
    toast({
      title: "Added to notes",
      description: "Content has been added as a new note",
    });
  };

  const handleFindReferences = async () => {
    setActiveTab("references");
    setIsSearching(true);
    
    // In a real implementation, this would call an API to get references
    // Simulating API call
    setTimeout(() => {
      const mockResults = [
        {
          title: "Understanding Key Concepts",
          type: "article",
          source: "Medium",
          url: "https://medium.com/article-example",
          description: "A comprehensive guide to the main concepts in this topic."
        },
        {
          title: "Expert Explanation Video",
          type: "video",
          source: "YouTube",
          url: "https://youtube.com/watch?example",
          description: "Visual explanation of the main principles and applications."
        },
        {
          title: "Academic Paper on the Subject",
          type: "paper",
          source: "Research Gate",
          url: "https://researchgate.net/paper-example",
          description: "Research findings and theoretical framework."
        }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1500);
  };

  // Fix ReactMarkdown usage - it doesn't support className directly
  const renderMarkdownContent = (content: string) => {
    return (
      <div className="prose prose-sm dark:prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 transition-all duration-200",
          "flex items-center justify-center"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[400px] shadow-lg animate-scale-in z-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              AI Study Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full mb-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="notes">Generate</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="space-y-4">
                <div className="text-sm">
                  How can I help with your studies today?
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {predefinedPrompts.map((item, index) => (
                    <Button 
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePredefinedPrompt(item.prompt)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <item.icon className="h-3 w-3" />
                      {item.text}
                    </Button>
                  ))}
                </div>
                
                {response && (
                  <div className="relative">
                    <div className="p-3 bg-secondary/50 rounded-md text-sm max-h-[200px] overflow-y-auto">
                      {renderMarkdownContent(response)}
                    </div>
                    
                    {showActionButtons && (
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyToClipboard}
                          className="flex items-center gap-1 text-xs"
                          disabled={isCopied}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </Button>
                        
                        {onAddToNotes && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddToNotes}
                            className="flex items-center gap-1 text-xs"
                            disabled={isAddedToNotes}
                          >
                            {isAddedToNotes ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Added
                              </>
                            ) : (
                              <>
                                <PlusCircle className="h-3 w-3" />
                                Add to Notes
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Ask anything about your notes..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isLoading && handleAssistantRequest()}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAssistantRequest}
                    disabled={isLoading || !prompt.trim()}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="edit" className="space-y-4">
                <div className="text-sm">
                  Let me help improve your notes with AI-powered editing
                </div>
                
                {editMode ? (
                  <>
                    <div className="p-3 bg-secondary/50 rounded-md text-sm max-h-[200px] overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert">
                        {response ? (
                          <ReactMarkdown>{response}</ReactMarkdown>
                        ) : (
                          <p>I'll generate improved content based on your selection.</p>
                        )}
                      </div>
                    </div>
                    
                    {showActionButtons && response && (
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyToClipboard}
                          className="flex items-center gap-1 text-xs"
                          disabled={isCopied}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditMode(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleApplyEdit}
                        disabled={!response}
                        className="flex-1"
                      >
                        Apply Changes
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleEnhanceNotes}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Enhance Writing
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setPrompt("Convert these notes into a structured outline with bullet points");
                        setEditMode(true);
                        handleAssistantRequest();
                      }}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Create Outline
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setPrompt("Fix grammar and spelling errors in these notes");
                        setEditMode(true);
                        handleAssistantRequest();
                      }}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Fix Grammar
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setPrompt("Make these notes more concise while preserving key information");
                        setEditMode(true);
                        handleAssistantRequest();
                      }}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Make Concise
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                <div className="text-sm">
                  Generate comprehensive study notes on any topic
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter a topic for your study notes..."
                      value={generateNotesTopicInput}
                      onChange={(e) => setGenerateNotesTopicInput(e.target.value)}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleGenerateNotes}
                      disabled={isLoading || !generateNotesTopicInput.trim()}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox" 
                      id="use-references"
                      checked={referenceContextEnabled}
                      onChange={() => setReferenceContextEnabled(!referenceContextEnabled)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="use-references" className="text-xs text-muted-foreground">
                      Use saved references ({references.length} available)
                    </label>
                  </div>
                </div>
                
                {response && (
                  <div className="relative">
                    <div className="p-3 bg-secondary/50 rounded-md text-sm max-h-[200px] overflow-y-auto">
                      {renderMarkdownContent(response)}
                    </div>
                    
                    {showActionButtons && (
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyToClipboard}
                          className="flex items-center gap-1 text-xs"
                          disabled={isCopied}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </Button>
                        
                        {onAddToNotes && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddToNotes}
                            className="flex items-center gap-1 text-xs"
                            disabled={isAddedToNotes}
                          >
                            {isAddedToNotes ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Added
                              </>
                            ) : (
                              <>
                                <PlusCircle className="h-3 w-3" />
                                Add to Notes
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="references" className="space-y-4">
                <div className="text-sm">
                  Let me find helpful references for your topic
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search for articles, videos, resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleFindReferences()}
                    className="flex-1"
                    disabled={isSearching}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleFindReferences}
                    disabled={isSearching}
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                  </Button>
                </div>
                
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <Card key={index} className="p-2">
                          <div className="flex items-start gap-2">
                            <div className="mt-1">
                              {result.type === 'video' && <Youtube className="h-4 w-4 text-red-500" />}
                              {result.type === 'article' && <BookOpen className="h-4 w-4 text-blue-500" />}
                              {result.type === 'paper' && <Link className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">{result.title}</div>
                                <a 
                                  href={result.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <div className="text-xs text-muted-foreground">{result.source}</div>
                              <div className="text-xs">{result.description}</div>
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      {searchResults.length === 0 && !isSearching && (
                        <div className="text-center p-4 text-sm text-muted-foreground">
                          Search for references or click suggestions below
                        </div>
                      )}
                      
                      {/* Quick reference options */}
                      {searchResults.length === 0 && (
                        <div className="pt-2">
                          <div className="text-xs font-medium mb-2">Quick Find:</div>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchQuery("YouTube tutorials");
                                handleFindReferences();
                              }}
                              className="text-xs"
                            >
                              <Youtube className="h-3 w-3 mr-1" />
                              YouTube Tutorials
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchQuery("Academic papers");
                                handleFindReferences();
                              }}
                              className="text-xs"
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              Academic Papers
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="text-xs text-muted-foreground">
              Powered by Gemini AI
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
