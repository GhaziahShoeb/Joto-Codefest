import { useState, useEffect } from 'react';

export function useTextSelection() {
  const [selectedText, setSelectedText] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const selectedStr = selection?.toString().trim() || '';
    
    if (selectedStr.length > 0) {
      setSelectedText(selectedStr);
      setIsSelecting(true);
    } else {
      setIsSelecting(false);
    }
  };
  
  const clearSelection = () => {
    setSelectedText('');
    setIsSelecting(false);
    window.getSelection()?.removeAllRanges();
  };
  
  const selectAllInElement = (element: HTMLElement | null) => {
    if (element) {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      setSelectedText(element.textContent || '');
      setIsSelecting(true);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
    };
  }, []);

  return {
    selectedText,
    isSelecting,
    clearSelection,
    selectAllInElement
  };
}
