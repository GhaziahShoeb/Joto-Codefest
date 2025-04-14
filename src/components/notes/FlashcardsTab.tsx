import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flashcard } from "@/types/notes";
import { Plus, Save, Database, Download, ArrowLeft, ArrowRight, Shuffle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/ai-service";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FlashcardsTabProps {
  flashcards: Flashcard[];
  setFlashcards: (flashcards: Flashcard[]) => void;
  savedFlashcards: Flashcard[];
  setSavedFlashcards: (flashcards: Flashcard[]) => void;
  content: string;
  difficultyLevel: string;
  setDifficultyLevel: (level: string) => void;
  flashcardsSubTab: string;
  setFlashcardsSubTab: (tab: string) => void;
}

/**
 * FlashcardsTab component for managing and studying flashcards
 */
const FlashcardsTab = ({
  flashcards,
  setFlashcards,
  savedFlashcards,
  setSavedFlashcards,
  content,
  difficultyLevel,
  setDifficultyLevel,
  flashcardsSubTab,
  setFlashcardsSubTab
}: FlashcardsTabProps) => {
  const { toast } = useToast();
  
  // Flashcard state
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFlashcardConfig, setShowFlashcardConfig] = useState(true);
  const [flashcardStyle, setFlashcardStyle] = useState("basic");
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [showAddFlashcard, setShowAddFlashcard] = useState(false);
  const [newFlashcard, setNewFlashcard] = useState({ front: '', back: '' });

  /**
   * Generate flashcards from content
   */
  const handleGenerateFlashcards = async () => {
    if (!content.trim()) {
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
        content,
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
        setCurrentCard(0);
        setIsFlipped(false);
        setShowFlashcardConfig(false); 
        
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
   * Reset flashcards to show configuration
   */
  const resetFlashcards = () => {
    setFlashcards([]);
    setShowFlashcardConfig(true);
  };
  
  /**
   * Flip the current flashcard
   */
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  /**
   * Move to the next flashcard
   */
  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  /**
   * Move to the previous flashcard
   */
  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  /**
   * Shuffle the flashcards
   */
  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCard(0);
    setIsFlipped(false);
  };

  /**
   * Save all flashcards
   */
  const handleSaveAllFlashcards = () => {
    if (flashcards.length === 0) {
      toast({
        title: "No flashcards to save",
        description: "Generate some flashcards first before saving them.",
        variant: "destructive",
      });
      return;
    }

    setSavedFlashcards([...savedFlashcards, ...flashcards]);
    
    toast({
      title: "Flashcards saved",
      description: `${flashcards.length} flashcards have been saved.`,
    });
  };

  /**
   * Save the current flashcard
   */
  const handleSaveCurrentFlashcard = () => {
    if (flashcards.length === 0) {
      toast({
        title: "No flashcard to save",
        description: "Generate some flashcards first before saving them.",
        variant: "destructive",
      });
      return;
    }

    const currentFlashcard = flashcards[currentCard];
    
    const isDuplicate = savedFlashcards.some(
      (card) => card.front === currentFlashcard.front && card.back === currentFlashcard.back
    );

    if (isDuplicate) {
      toast({
        title: "Duplicate flashcard",
        description: "This flashcard has already been saved.",
        variant: "destructive",
      });
      return;
    }

    setSavedFlashcards([...savedFlashcards, currentFlashcard]);
    
    toast({
      title: "Flashcard saved",
      description: "Current flashcard has been saved.",
    });
  };

  /**
   * Add a new flashcard manually
   */
  const handleAddFlashcard = () => {
    if (!newFlashcard.front.trim() || !newFlashcard.back.trim()) {
      toast({
        title: "Incomplete flashcard",
        description: "Please fill in both front and back of the flashcard.",
        variant: "destructive",
      });
      return;
    }

    const flashcardToAdd = {
      ...newFlashcard,
      id: Date.now(),
    };

    setFlashcards([...flashcards, flashcardToAdd]);
    setNewFlashcard({ front: '', back: '' });
    setShowAddFlashcard(false);
    
    toast({
      title: "Flashcard added",
      description: "New flashcard has been added.",
    });
  };

  /**
   * Export flashcards as JSON
   */
  const handleExportFlashcards = () => {
    const dataToExport = flashcards.length > 0 ? flashcards : savedFlashcards;
    
    if (dataToExport.length === 0) {
      toast({
        title: "No flashcards to export",
        description: "Generate or save some flashcards first before exporting.",
        variant: "destructive",
      });
      return;
    }
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Flashcards exported",
      description: "Your flashcards have been exported as JSON.",
    });
  };

  return (
    <Tabs 
      value={flashcardsSubTab} 
      onValueChange={setFlashcardsSubTab} 
      className="w-full"
    >
      <TabsList className="mb-4 w-full justify-start">
        <TabsTrigger value="current">Current</TabsTrigger>
        <TabsTrigger value="saved">Saved ({savedFlashcards.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="current" className="mt-0">
        {flashcards.length > 0 ? (
          <>
            <div className="flex justify-between mb-4">
              <div>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => setShowAddFlashcard(!showAddFlashcard)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Card
                </Button>
                <Button variant="outline" size="sm" className="mr-2" onClick={handleSaveCurrentFlashcard}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Current
                </Button>
                <Button variant="outline" size="sm" className="mr-2" onClick={handleSaveAllFlashcards}>
                  <Database className="mr-2 h-4 w-4" />
                  Save All
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportFlashcards}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={resetFlashcards}>
                Configure New Flashcards
              </Button>
            </div>
            
            {showAddFlashcard && (
              <Card className="mb-6 border-dashed">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Add New Flashcard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Front</label>
                      <Textarea 
                        placeholder="Enter front text (question or term)..."
                        value={newFlashcard.front}
                        onChange={(e) => setNewFlashcard({...newFlashcard, front: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Back</label>
                      <Textarea 
                        placeholder="Enter back text (answer or definition)..."
                        value={newFlashcard.back}
                        onChange={(e) => setNewFlashcard({...newFlashcard, back: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowAddFlashcard(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddFlashcard}>
                        Add Flashcard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-6">
              <div 
                className="relative cursor-pointer mx-auto max-w-2xl h-80 perspective-1000"
                onClick={handleFlip}
              >
                <div 
                  className={cn(
                    "absolute inset-0 transition-transform duration-500 preserve-3d",
                    isFlipped ? "rotate-y-180" : ""
                  )}
                >
                  <Card className="absolute inset-0 flex items-center justify-center p-6 backface-hidden">
                    <CardContent className="p-6 text-center">
                      <p className="text-xl">{flashcards[currentCard].front}</p>
                    </CardContent>
                  </Card>
                  <Card className="absolute inset-0 flex items-center justify-center p-6 rotate-y-180 backface-hidden bg-primary text-primary-foreground">
                    <CardContent className="p-6 text-center">
                      <p className="text-xl">{flashcards[currentCard].back}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={handlePrev} disabled={currentCard === 0}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  {currentCard + 1} of {flashcards.length}
                </div>
                <Button variant="outline" onClick={handleNext} disabled={currentCard === flashcards.length - 1}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleShuffle}>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Shuffle
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="border rounded-md p-6 space-y-4">
            <h3 className="text-lg font-medium">Flashcard Configuration</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Flashcard Style</Label>
                <Select
                  value={flashcardStyle}
                  onValueChange={setFlashcardStyle}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select flashcard style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (Term - Definition)</SelectItem>
                    <SelectItem value="concept">Concept Based</SelectItem>
                    <SelectItem value="question">Question - Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Difficulty Level</Label>
                <Select
                  value={difficultyLevel}
                  onValueChange={setDifficultyLevel}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="flashcard-count" className="text-sm font-medium">Number of Flashcards</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Slider
                    id="flashcard-count"
                    min={1}
                    max={30}
                    step={1}
                    value={[flashcardCount]}
                    onValueChange={(values) => setFlashcardCount(values[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-medium">{flashcardCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select between 1-30 cards to generate
                </p>
              </div>
              <Button 
                onClick={handleGenerateFlashcards} 
                disabled={isGeneratingFlashcards || !content.trim()}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {isGeneratingFlashcards ? "Generating..." : "Generate Flashcards"}
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="saved" className="mt-0">
        {savedFlashcards.length > 0 ? (
          <>
            <div className="flex justify-between mb-4">
              <div>
                <Button variant="outline" size="sm" onClick={handleExportFlashcards}>
                  <Download className="mr-2 h-4 w-4" />
                  Export All
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSavedFlashcards([]);
                  toast({
                    title: "Saved flashcards cleared",
                    description: "All saved flashcards have been removed.",
                  });
                }}
              >
                Clear Saved
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedFlashcards.map((card) => (
                <Card 
                  key={card.id} 
                  className="overflow-hidden cursor-pointer h-48 hover:border-primary transition-colors"
                  onClick={() => {
                    // Add the card to current flashcards if not already there
                    if (!flashcards.some(f => f.id === card.id)) {
                      setFlashcards([...flashcards, card]);
                      setFlashcardsSubTab("current");
                      toast({
                        title: "Flashcard loaded",
                        description: "Saved flashcard added to current session.",
                      });
                    }
                  }}
                >
                  <CardHeader className="p-3 bg-muted/50">
                    <CardTitle className="truncate text-sm">Term: {card.front}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="line-clamp-4 text-sm">{card.back}</p>
                  </CardContent>
                  <CardFooter className="p-3 border-t flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSavedFlashcards(savedFlashcards.filter(f => f.id !== card.id));
                        toast({
                          title: "Flashcard removed",
                          description: "Flashcard has been removed from saved items.",
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 border rounded-md">
            <h3 className="text-lg font-medium mb-2">No Saved Flashcards</h3>
            <p className="text-muted-foreground mb-4">
              Save some flashcards from your current session to access them later.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setFlashcardsSubTab("current")}
            >
              Go to Current Flashcards
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default FlashcardsTab;
