
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function NotesEditor({ value, onChange, className, ...props }: NotesEditorProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>) {
  const [selectedText, setSelectedText] = useState<string>("");
  
  const handleSelect = (e: React.MouseEvent<HTMLTextAreaElement> | React.TouchEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const selected = target.value.substring(target.selectionStart || 0, target.selectionEnd || 0);
    setSelectedText(selected);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={handleChange}
        onMouseUp={handleSelect}
        onTouchEnd={handleSelect}
        className={cn(
          "min-h-[300px] font-medium text-base leading-relaxed p-4",
          "focus:border-primary/50 focus:ring-primary/50",
          className
        )}
        {...props}
      />
    </div>
  );
}
