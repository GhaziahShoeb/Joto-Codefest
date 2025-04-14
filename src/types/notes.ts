/**
 * Type definitions for the notes application
 */

export type Flashcard = {
  id: number;
  front: string;
  back: string;
};

export type QuestionItem = {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  userAnswer: string | null;
};

export type Reference = {
  id: number;
  type: 'link' | 'pdf' | 'image' | 'ppt' | 'syllabus' | 'other';
  name: string;
  description?: string;
  url?: string;
  file?: File;
  content?: string;
  priority: number;
  dateAdded: Date;
  fileSize?: number;
};
