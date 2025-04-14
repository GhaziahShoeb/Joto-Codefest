import { Button } from "@/components/ui/button";
import { 
  Lightbulb, FileQuestion, Sparkles, Highlighter, 
  Bold, Italic, List, AlignLeft, AlignCenter, AlignRight,
  Palette, ListOrdered, Quote, Type, Loader2
} from "lucide-react";
import { aiService } from "@/services/ai-service";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme"; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EditorTabProps {
  content: string;
  setContent: (content: string) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  setActiveTab: (tab: string) => void;
  setFlashcards: (flashcards: any[]) => void;
  setQuestions: (questions: any[]) => void;
  useReferencesForAI?: boolean;
  references?: any[];
}

/**
 * EditorTab component with a Microsoft Word-like editor
 */
const EditorTab = ({
  content,
  setContent,
  selectedText,
  setSelectedText,
  setActiveTab,
  setFlashcards,
  setQuestions,
  useReferencesForAI = true,
  references = []
}: EditorTabProps) => {
  const { toast } = useToast();
  const { resolvedTheme } = useTheme(); // Add theme support
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isBeautifying, setIsBeautifying] = useState(false);
  
  // Font size options matching the image (18px is selected in the image)
  const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
  const [fontSize, setFontSize] = useState("18px");
  
  // Add missing state variables
  const [flashcardStyle, setFlashcardStyle] = useState("basic");
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [flashcardCount, setFlashcardCount] = useState(10);

  // Use a ref for the contentEditable div
  const editorRef = useRef<HTMLDivElement>(null);

  // Define text colors and highlight colors
  const textColors = [
    { name: "Black", color: "#000000" },
    { name: "Red", color: "#ff0000" },
    { name: "Blue", color: "#0000ff" },
    { name: "Green", color: "#008000" },
    { name: "Purple", color: "#800080" },
    { name: "Orange", color: "#ffa500" }
  ];
  
  const highlightColors = [
    { name: "Yellow", color: "#ffff00" },
    { name: "Green", color: "#00ff00" },
    { name: "Blue", color: "#00ffff" },
    { name: "Pink", color: "#ffb6c1" },
    { name: "Purple", color: "#e6e6fa" }
  ];

  // Initialize editor with content and apply theme
  useEffect(() => {
    if (editorRef.current) {
      // Only set content if editor is empty or content changed
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '';
      }
      
      // Apply theme appropriate styles
      editorRef.current.style.backgroundColor = resolvedTheme === 'dark' ? '#1a1a1a' : 'white';
      editorRef.current.style.color = resolvedTheme === 'dark' ? '#e1e1e1' : 'inherit';
    }
  }, [content, resolvedTheme]);

  // Save content when editor changes
  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  /**
   * Select all text in the editor
   */
  const selectAllText = () => {
    if (editorRef.current) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        setSelectedText(selection.toString());
      }
    }
  };

  /**
   * Handle text selection in the editor
   */
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedContent = selection.toString();
      setSelectedText(selectedContent);
    }
  };

  /**
   * Apply document command (basic formatting)
   */
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorChange();
    }
  };

  /**
   * Format text as heading
   */
  const formatAsHeading = (size: string) => {
    // Use font size instead of H1, H2 tags
    applyFontSize(size);
    execCommand('bold');
  };

  /**
   * Apply font size
   */
  const applyFontSize = (size: string) => {
    setFontSize(size);
    if (editorRef.current) {
      const selection = window.getSelection();
      
      // If text is selected, apply font size to selection only
      if (selection && !selection.isCollapsed) {
        execCommand('fontSize', '7'); // Use arbitrary size value
        
        // Get all newly sized elements and adjust to the proper size
        const elements = document.querySelectorAll('[size="7"]');
        elements.forEach(el => {
          el.removeAttribute('size');
          (el as HTMLElement).style.fontSize = size;
        });
      } else {
        // If no selection, create a span with the font size where the cursor is
        const span = document.createElement('span');
        span.style.fontSize = size;
        
        execCommand('insertHTML', span.outerHTML);
      }
      
      handleEditorChange();
    }
  };

  /**
   * Apply text color
   */
  const applyTextColor = (color: string) => {
    execCommand('foreColor', color);
  };

  /**
   * Apply text highlight
   */
  const applyHighlight = (color: string) => {
    execCommand('hiliteColor', color);
  };

  /**
   * AI Beautify notes - converts plain text to properly formatted document with enhanced content
   */
  const handleBeautifyNotes = async () => {
    const textToBeautify = selectedText || (editorRef.current?.innerHTML || '');
    
    if (!textToBeautify.trim()) {
      toast({
        title: "No content to beautify",
        description: "Please add some content to your notes first or select specific text.",
        variant: "destructive",
      });
      return;
    }
    
    setIsBeautifying(true);
    
    try {
      // Show toast notification to indicate process has started
      toast({
        title: "Beautifying notes...",
        description: "Enhancing your notes with AI formatting and improvements",
      });
      
      // Add reference context if enabled and available
      let referenceContext = "";
      if (useReferencesForAI && references && references.length > 0) {
        referenceContext = "\n\nConsider these references when enhancing the content:\n" + 
          references.map((ref, index) => {
            return `${index + 1}. ${ref.name} - ${ref.description || 'No description available'} ${ref.url ? '(Source: ' + ref.url + ')' : ''}`;
          }).join("\n");
      }
      
      // Instructions for different levels of beautification - specifically requesting HTML output
      const beautifyInstructions = 
        "Beautify and enhance these notes by: \n" +
        "1. Improving the structure with proper headings, paragraphs and bullet points\n" +
        "2. Fixing any grammar or spelling errors\n" +
        "3. Enhancing clarity and readability\n" +
        "4. Adding emphasis to important concepts\n" +
        "5. Keeping all the original content but making it more coherent\n" +
        `${useReferencesForAI && references && references.length > 0 ? 
           "6. Incorporating knowledge from the provided references where relevant\n" : ""}` +
        "IMPORTANT: Return the beautified content with complete HTML formatting. Use proper <h1>, <h2>, <strong>, <em>, <ul>, <li>, <p> tags. Do NOT return markdown format." +
        referenceContext;
      
      // Call Gemini API through our service with explicit HTML request
      const enhancedHTML = await aiService.enhanceText(textToBeautify, beautifyInstructions);
      
      // Clean up HTML output - remove any residual markdown markers or surrounding code blocks
      let cleanedHTML = enhancedHTML
        .replace(/^```html|```$/g, '') // Remove markdown code block markers
        .replace(/&lt;/g, '<')          // Replace HTML entities
        .replace(/&gt;/g, '>')
        .replace(/^\s*<html>|<\/html>\s*$/g, '') // Remove root html tag if present
        .replace(/^\s*<body>|<\/body>\s*$/g, '') // Remove body tag if present
        .trim();
      
      // Apply the beautified content appropriately
      if (selectedText) {
        // If there was selected text, only replace that portion
        if (editorRef.current) {
          // Get the current selection
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            // Replace the content of the range with the enhanced HTML
            range.deleteContents();
            
            // Create a temporary div to hold the HTML content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cleanedHTML;
            
            // Insert the fragment into the editor
            const fragment = document.createDocumentFragment();
            while (tempDiv.firstChild) {
              fragment.appendChild(tempDiv.firstChild);
            }
            range.insertNode(fragment);
            
            // Update content state
            setContent(editorRef.current.innerHTML);
            setSelectedText("");
          }
        }
      } else {
        // If no selection, update the entire editor content
        if (editorRef.current) {
          editorRef.current.innerHTML = cleanedHTML;
          setContent(editorRef.current.innerHTML);
        }
      }
      
      toast({
        title: "Notes beautified",
        description: `Your notes have been enhanced for better readability and clarity${
          useReferencesForAI && references && references.length > 0 ? 
            ", incorporating insights from your references" : ""
        }.`,
      });
    } catch (error) {
      console.error("Beautification error:", error);
      toast({
        title: "Beautification failed",
        description: "There was an error beautifying your notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBeautifying(false);
    }
  };

  /**
   * Generate flashcards from content or selected text
   */
  const handleGenerateFlashcards = async () => {
    const textToProcess = selectedText || (editorRef.current?.textContent || '');
    
    if (!textToProcess.trim()) {
      toast({
        title: "No content to process",
        description: "Please add some content to your note or select specific text to generate flashcards.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingFlashcards(true);
    
    try {
      const result = await aiService.generateFlashcards(
        textToProcess,
        flashcardStyle,
        difficultyLevel,
        flashcardCount
      );
      
      if (result && Array.isArray(result) && result.length > 0) {
        const flashcardsWithIds = result.map((card, index) => ({
          ...card,
          id: Date.now() + index
        }));
        
        setFlashcards(flashcardsWithIds);
        setActiveTab("flashcards");
        
        toast({
          title: "Flashcards generated",
          description: `Successfully created ${flashcardsWithIds.length} flashcards from your notes.`,
        });
      } else {
        throw new Error("Could not generate valid flashcards");
      }
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      toast({
        title: "Failed to generate flashcards",
        description: error instanceof Error ? error.message : "There was an error generating flashcards.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  /**
   * Generate questions from selection
   */
  const handleGenerateQuestionsFromSelection = () => {
    if (!selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please select some text first to generate questions from it.",
        variant: "destructive",
      });
      return;
    }
    
    setActiveTab("questions");
    
    // We'll handle the question generation in the Questions tab component
  };

  return (
    <div>
      {/* Word-like Toolbar - without markdown heading options */}
      <div className={`flex flex-wrap items-center gap-1 mb-3 p-2 border rounded-md overflow-x-auto ${resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {/* Text formatting - simplified without H1, H2 tags */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => formatAsHeading('24px')}
          title="Large Heading"
          className="h-8 w-8 p-0"
        >
          <Type className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('bold')}
          title="Bold"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('italic')}
          title="Italic"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Font size dropdown - matching the image */}
        <Select value={fontSize} onValueChange={applyFontSize}>
          <SelectTrigger className="h-8 w-[70px] px-2 text-xs">
            <SelectValue placeholder={fontSize} />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map(size => (
              <SelectItem key={size} value={size} className="text-xs">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Lists - matching the image */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('formatBlock', '<blockquote>')}
          title="Quote"
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Alignment - matching the image */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
          className="h-8 w-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Colors - matching the image */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Text Color">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-3 gap-1">
              {textColors.map(color => (
                <Button 
                  key={color.name} 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => applyTextColor(color.color)}
                  className="h-8 w-8 p-0"
                  title={color.name}
                >
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color.color, border: '1px solid #ddd' }}></div>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Highlight Color">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-3 gap-1">
              {highlightColors.map(color => (
                <Button 
                  key={color.name} 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => applyHighlight(color.color)}
                  className="h-8 w-8 p-0"
                  title={color.name}
                >
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: color.color }}></div>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* AI Features */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBeautifyNotes}
                disabled={isBeautifying}
                className="h-8 flex gap-1"
              >
                {isBeautifying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Beautify</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI Beautify: Enhance your notes with better formatting and clarity</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Right-side toolbar */}
        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAllText} 
            className={`h-8 ${resolvedTheme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : ''}`}
          >
            Select All
          </Button>
        </div>
      </div>
      
      {/* Simple clean editor with dark mode support */}
      <div 
        ref={editorRef}
        contentEditable
        className={`min-h-[500px] p-4 border rounded-md focus:outline-none text-base leading-relaxed overflow-auto ${
          resolvedTheme === 'dark' 
            ? 'border-gray-700 focus:border-gray-500 focus:ring-gray-500' 
            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
        }`}
        onInput={handleEditorChange}
        onSelect={handleTextSelection}
        onMouseUp={handleTextSelection}
        onKeyUp={handleTextSelection}
        onBlur={handleEditorChange}
        style={{ 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: resolvedTheme === 'dark' ? '#1a1a1a' : 'white',
          color: resolvedTheme === 'dark' ? '#e1e1e1' : 'inherit'
        }}
      />
      
      {/* Selected Text Panel with dark mode support */}
      {selectedText && (
        <div className={`mt-4 p-3 border rounded-md ${
          resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
              {selectedText.length} characters selected
            </span>
            <div className="ml-auto flex gap-2">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedText("")}
              >
                Clear
              </Button>
              <Button 
                size="sm" 
                onClick={handleBeautifyNotes}
                disabled={isBeautifying}
              >
                {isBeautifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance Selection
                  </>
                )}
              </Button>
              <Button 
                size="sm" 
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingFlashcards}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {isGeneratingFlashcards ? "Generating..." : "Generate Flashcards"}
              </Button>
              <Button 
                size="sm" 
                onClick={handleGenerateQuestionsFromSelection}
                disabled={isGeneratingQuestions}
              >
                <FileQuestion className="mr-2 h-4 w-4" />
                {isGeneratingQuestions ? "Generating..." : "Generate Questions"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorTab;
