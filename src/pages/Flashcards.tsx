
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Plus, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

const flashcardsDemoData = [
  {
    id: 1,
    front: "What is the capital of France?",
    back: "Paris",
  },
  {
    id: 2,
    front: "What is the square root of 144?",
    back: "12",
  },
  {
    id: 3,
    front: "What is the chemical symbol for water?",
    back: "H₂O",
  }
];

const Flashcards = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState(flashcardsDemoData);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCard(0);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground">Review and study with flashcards</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Flashcards
        </Button>
      </div>

      {flashcards.length > 0 ? (
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
      ) : (
        <div className="text-center p-12 border rounded-lg">
          <p className="mb-4">No flashcards found. Create some to get started!</p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Flashcards
          </Button>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
