import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileQuestion, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingSelectionToolbarProps {
  isVisible: boolean;
  onGenerateFlashcards: () => void;
  onGenerateQuestions: () => void;
}

export function FloatingSelectionToolbar({
  isVisible,
  onGenerateFlashcards,
  onGenerateQuestions
}: FloatingSelectionToolbarProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && isVisible) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        if (toolbarRef.current) {
          const toolbarWidth = toolbarRef.current.offsetWidth;
          const toolbarHeight = toolbarRef.current.offsetHeight;
          
          // Position above the selection
          let top = rect.top - toolbarHeight - 10 + window.scrollY;
          let left = rect.left + (rect.width / 2) - (toolbarWidth / 2) + window.scrollX;
          
          // Ensure it stays within viewport
          if (top < 0) {
            top = rect.bottom + 10 + window.scrollY; // Position below instead
          }
          
          // Adjust horizontal position if out of bounds
          if (left < 10) {
            left = 10;
          } else if (left + toolbarWidth > window.innerWidth - 10) {
            left = window.innerWidth - toolbarWidth - 10;
          }
          
          setPosition({ top, left });
        }
      }
    };

    updatePosition();
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "fixed z-50 p-2 rounded-md shadow-md bg-popover border",
        "animate-fade-in transition-opacity",
        "flex gap-2"
      )}
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`
      }}
    >
      <Button variant="outline" size="sm" onClick={onGenerateFlashcards}>
        <Lightbulb className="h-4 w-4 mr-1" />
        Flashcards
      </Button>
      <Button variant="outline" size="sm" onClick={onGenerateQuestions}>
        <FileQuestion className="h-4 w-4 mr-1" />
        Questions
      </Button>
    </div>
  );
}
