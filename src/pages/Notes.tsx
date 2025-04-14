import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save } from "lucide-react";
import { AIAssistantButton } from "@/components/ai-assistant-button";
import { useToast } from "@/hooks/use-toast";
import { useAIAssistant } from "@/hooks/use-ai-assistant";
import { cn } from "@/lib/utils";

// Component imports
import EditorTab from "@/components/notes/EditorTab";
import FlashcardsTab from "@/components/notes/FlashcardsTab";
import QuestionsTab from "@/components/notes/QuestionsTab";
import ReferencesTab from "@/components/notes/ReferencesTab";

// Type imports
import { Flashcard, Reference, QuestionItem } from "@/types/notes";

/**
 * Notes Page Component
 * 
 * A comprehensive page for creating, managing and studying notes with
 * features like flashcards, questions, and reference materials.
 */
const Notes = () => {
  // Main state
  const [activeTab, setActiveTab] = useState("editor");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  
  // Common settings
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  
  // Hooks
  const { toast } = useToast();
  const { generateContent, isLoading: aiLoading } = useAIAssistant();
  
  // References state
  const [references, setReferences] = useState<Reference[]>([]);
  const [useReferencesForAI, setUseReferencesForAI] = useState(true);
  
  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [savedFlashcards, setSavedFlashcards] = useState<Flashcard[]>([]);
  const [flashcardsSubTab, setFlashcardsSubTab] = useState("current");
  
  // Questions state
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<QuestionItem[]>([]);
  const [questionsSubTab, setQuestionsSubTab] = useState("current");
  const [questionContext, setQuestionContext] = useState("");

  /**
   * Handle text selection in the editor
   */
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selectedStr = selection.toString();
      setSelectedText(selectedStr);
      
      // Show a toast notification when text is selected
      if (selectedStr.length > 20) {
        toast({
          title: "Text selected",
          description: `${selectedStr.length} characters selected. Use AI tools to enhance this selection.`,
        });
      }
    }
  };
  
  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("touchend", handleTextSelection);
    
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("touchend", handleTextSelection);
    };
  }, []);

  /**
   * Handle saving the current note
   */
  const handleSaveNote = () => {
    if (!title.trim()) {
      toast({
        title: "Note title required",
        description: "Please add a title to your note before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulating save operation
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
    }, 1000);
  };

  /**
   * Generate notes from references
   */
  const handleGenerateFromReferences = () => {
    if (references.length === 0) {
      toast({
        title: "No references available",
        description: "Add some references first to use this feature.",
        variant: "destructive",
      });
      return;
    }
    
    // Set active tab to editor
    setActiveTab("editor");
    
    toast({
      title: "Generating from references",
      description: "AI is generating detailed notes from your references.",
    });
    
    // Get the most recently added reference or one with highest priority
    const primaryReference = [...references].sort((a, b) => b.priority - a.priority)[0];
    
    setTimeout(() => {
      // Extract name without extension
      const nameWithoutExt = primaryReference.name.replace(/\.(pdf|jpg|png|ppt|pptx)$/i, '');
      
      // Create a title based on the reference
      setTitle(`Notes on ${nameWithoutExt}`);
      
      // Create detailed and organized HTML content
      // This simulates what would come from Gemini API when processing the document
      const generatedContent = `
        <h1>Notes on ${nameWithoutExt}</h1>
        
        <p>These notes are based on the ${primaryReference.type} reference "${primaryReference.name}".</p>
        
        <h2>Document Overview</h2>
        <p>${nameWithoutExt} contains detailed information about ${primaryReference.description || "the subject matter"}. The material is structured to provide both theoretical understanding and practical application.</p>
        
        <h3>Main Topics</h3>
        <ul>
          <li><strong>Topic 1:</strong> Introduction to core concepts and fundamental principles</li>
          <li><strong>Topic 2:</strong> Detailed examination of key components and their relationships</li>
          <li><strong>Topic 3:</strong> Advanced applications and implementation strategies</li>
        </ul>
        
        <h2>Detailed Analysis</h2>
        <p>The document provides comprehensive coverage of several important aspects:</p>
        
        <h3>Section 1: Foundations</h3>
        <p>This section establishes the theoretical background necessary for understanding the subject matter. Key points include:</p>
        <ul>
          <li>Historical development and evolution of concepts</li>
          <li>Fundamental principles and their implications</li>
          <li>Relationship to other areas of study and practice</li>
        </ul>
        
        <h3>Section 2: Methodology</h3>
        <p>The methodology section outlines approaches for implementing and applying the concepts. Important elements include:</p>
        <ol>
          <li>Step-by-step procedures for standard operations</li>
          <li>Best practices for efficient implementation</li>
          <li>Quality control measures and evaluation criteria</li>
        </ol>
        
        <h3>Section 3: Applications</h3>
        <p>This portion of the document explores practical applications across various contexts:</p>
        <ul>
          <li>Case studies illustrating successful implementations</li>
          <li>Common challenges and effective solutions</li>
          <li>Emerging trends and future directions</li>
        </ul>
        
        <h2>Key Terminology</h2>
        <p>The document introduces several important terms that are central to understanding the material:</p>
        <ul>
          <li><strong>Term 1:</strong> Definition and significance in context</li>
          <li><strong>Term 2:</strong> Relationship to broader concepts</li>
          <li><strong>Term 3:</strong> Practical implications and applications</li>
        </ul>
        
        <h2>Summary</h2>
        <p>${nameWithoutExt} provides a thorough examination of ${primaryReference.description || "the subject matter"}, offering valuable insights for both theoretical understanding and practical application. The material is well-organized and presents information in a clear, accessible format.</p>
      `;
      
      // Set the content with clean formatting
      setContent(generatedContent.replace(/^\s+/gm, ''));
    }, 1000);
  };

  /**
   * Handle AI assistant edits
   */
  const handleApplyAIEdit = (newContent: string) => {
    if (selectedText) {
      // Replace selected text with AI-generated content
      const newFullContent = content.replace(selectedText, newContent);
      setContent(newFullContent);
      setSelectedText("");
      
      toast({
        title: "Text updated",
        description: "The selected text has been updated with AI suggestions.",
      });
    } else {
      // Replace entire content
      setContent(newContent);
      
      toast({
        title: "Note updated",
        description: "Your note has been updated with AI suggestions.",
      });
    }
  };

  /**
   * Handle adding a new note from AI-generated content
   */
  const handleAddAIGeneratedNote = (content: string, title?: string) => {
    // First, save the current note if it has content and title
    if (content.trim() && title?.trim()) {
      // Create a new note with the AI-generated content
      toast({
        title: "New note created",
        description: `"${title}" has been added to your notes.`,
      });
      
      // In a real implementation, this would save the current note first
      // and then create a new note with the AI content
      
      // For this example, we'll set the current note to the new content
      setTitle(title);
      setContent(content);
      
      // Switch to the editor tab to show the new content
      setActiveTab("editor");
    } else {
      // If missing title, just update the current note content
      setContent((prev) => {
        const newContent = prev ? `${prev}\n\n${content}` : content;
        return newContent;
      });
      
      toast({
        title: "Content added",
        description: "AI-generated content has been added to your current note.",
      });
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in relative">
      <Card className="animate-scale-in">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Input 
                placeholder="Note Title" 
                className="text-xl font-medium border-none px-0 focus-visible:ring-0" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <CardDescription>Last edited: Just now</CardDescription>
            </div>
            <Button className="mr-1" onClick={() => setTitle(`New Note ${new Date().toLocaleDateString()}`)}>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
            </TabsList>
            
            {/* Editor Tab */}
            <TabsContent value="editor" className="mt-0">
              <EditorTab
                content={content}
                setContent={setContent}
                selectedText={selectedText}
                setSelectedText={setSelectedText}
                setActiveTab={setActiveTab}
                setFlashcards={setFlashcards}
                setQuestions={setQuestions}
              />
            </TabsContent>
            
            {/* Flashcards Tab */}
            <TabsContent value="flashcards" className="mt-0">
              <FlashcardsTab
                flashcards={flashcards}
                setFlashcards={setFlashcards}
                savedFlashcards={savedFlashcards}
                setSavedFlashcards={setSavedFlashcards}
                content={content}
                difficultyLevel={difficultyLevel}
                setDifficultyLevel={setDifficultyLevel}
                flashcardsSubTab={flashcardsSubTab}
                setFlashcardsSubTab={setFlashcardsSubTab}
              />
            </TabsContent>
            
            {/* Questions Tab */}
            <TabsContent value="questions" className="mt-0">
              <QuestionsTab
                questions={questions}
                setQuestions={setQuestions}
                savedQuestions={savedQuestions}
                setSavedQuestions={setSavedQuestions}
                content={content}
                difficultyLevel={difficultyLevel}
                setDifficultyLevel={setDifficultyLevel}
                questionContext={questionContext}
                setQuestionContext={setQuestionContext}
                questionsSubTab={questionsSubTab}
                setQuestionsSubTab={setQuestionsSubTab}
                useReferencesForAI={useReferencesForAI}
                references={references}
              />
            </TabsContent>
            
            {/* References Tab */}
            <TabsContent value="references" className="mt-0">
              <ReferencesTab
                references={references}
                setReferences={setReferences}
                setActiveTab={setActiveTab}
                setTitle={setTitle}
                setContent={setContent}
                useReferencesForAI={useReferencesForAI}
                setUseReferencesForAI={setUseReferencesForAI}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" className="text-muted-foreground">
            Cancel
          </Button>
          <Button onClick={handleSaveNote} disabled={isLoading}>
            {isLoading ? "Saving..." : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Note
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <AIAssistantButton 
        currentNote={content} 
        selectedText={selectedText}
        onApplyEdit={handleApplyAIEdit}
        references={references}
        onAddToNotes={handleAddAIGeneratedNote}
      />
    </div>
  );
};

export default Notes;
