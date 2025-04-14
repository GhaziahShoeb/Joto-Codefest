import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionItem } from "@/types/notes";
import { Lightbulb, Plus, Database, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/ai-service";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface QuestionsTabProps {
  questions: QuestionItem[];
  setQuestions: (questions: QuestionItem[]) => void;
  savedQuestions: QuestionItem[];
  setSavedQuestions: (questions: QuestionItem[]) => void;
  content: string;
  difficultyLevel: string;
  setDifficultyLevel: (level: string) => void;
  questionContext: string;
  setQuestionContext: (context: string) => void;
  questionsSubTab: string;
  setQuestionsSubTab: (tab: string) => void;
  useReferencesForAI?: boolean;
  references?: any[];
}

/**
 * QuestionsTab component for managing and answering study questions
 */
const QuestionsTab = ({
  questions,
  setQuestions,
  savedQuestions,
  setSavedQuestions,
  content,
  difficultyLevel,
  setDifficultyLevel,
  questionContext,
  setQuestionContext,
  questionsSubTab,
  setQuestionsSubTab,
  useReferencesForAI = true,
  references = []
}: QuestionsTabProps) => {
  const { toast } = useToast();
  
  // Questions state
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionType, setQuestionType] = useState("multiplechoice");
  const [questionCount, setQuestionCount] = useState(5);
  const [marksPerQuestion, setMarksPerQuestion] = useState(5);
  const [newQuestion, setNewQuestion] = useState({ 
    question: '', 
    options: ['', '', '', ''], 
    correctAnswer: '', 
    explanation: '' 
  });

  /**
   * Generate questions from content
   */
  const handleGenerateQuestions = async () => {
    if (!content.trim()) {
      toast({
        title: "No content to process",
        description: "Please add some content to your note to generate questions.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingQuestions(true);
    
    try {
      // Add reference context if enabled
      let referenceContext = "";
      if (useReferencesForAI && references && references.length > 0) {
        referenceContext = "\n\nConsider these references while creating questions:\n" + 
          references.map((ref, index) => {
            return `${index + 1}. ${ref.name} - ${ref.description || 'No description available'} ${ref.url ? '(Source: ' + ref.url + ')' : ''}`;
          }).join("\n");
      }
      
      // Combine user-provided context with references if available
      const combinedContext = questionContext + 
        (useReferencesForAI && references && references.length > 0 ? referenceContext : "");
      
      const result = await aiService.generateQuestions(
        content,
        questionType,
        difficultyLevel,
        questionCount,
        combinedContext
      );
      
      if (result && Array.isArray(result) && result.length > 0) {
        const questionsWithIds = result.map((q, index) => ({
          ...q,
          id: Date.now() + index,
          userAnswer: null
        }));
        
        setQuestions(questionsWithIds);
        
        toast({
          title: "Questions generated",
          description: `Successfully created ${questionsWithIds.length} questions from your notes${
            useReferencesForAI && references && references.length > 0 ? 
              ", enriched with reference knowledge" : ""
          }.`,
        });
      } else {
        throw new Error("Could not generate valid questions");
      }
    } catch (error) {
      console.error("Failed to generate questions:", error);
      toast({
        title: "Failed to generate questions",
        description: "There was an error generating questions from your content.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  /**
   * Reset questions
   */
  const resetQuestions = () => {
    setQuestions([]);
  };

  /**
   * Handle answering a question
   */
  const handleAnswerQuestion = (questionId: number, answer: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, userAnswer: answer } : q
    ));
  };

  /**
   * Save all questions
   */
  const handleSaveAllQuestions = () => {
    if (questions.length === 0) {
      toast({
        title: "No questions to save",
        description: "Generate some questions first before saving them.",
        variant: "destructive",
      });
      return;
    }

    setSavedQuestions([...savedQuestions, ...questions]);
    
    toast({
      title: "Questions saved",
      description: `${questions.length} questions have been saved.`,
    });
  };

  /**
   * Add a new question manually
   */
  const handleAddQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.correctAnswer.trim()) {
      toast({
        title: "Incomplete question",
        description: "Please fill in at least the question and correct answer.",
        variant: "destructive",
      });
      return;
    }

    const questionToAdd = {
      ...newQuestion,
      id: Date.now(),
      userAnswer: null,
      options: newQuestion.options.filter(opt => opt.trim() !== '')
    };

    setQuestions([...questions, questionToAdd]);
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
    setShowAddQuestion(false);
    
    toast({
      title: "Question added",
      description: "New question has been added.",
    });
  };

  return (
    <Tabs 
      value={questionsSubTab} 
      onValueChange={setQuestionsSubTab} 
      className="w-full"
    >
      <TabsList className="mb-4 w-full justify-start">
        <TabsTrigger value="current">Current</TabsTrigger>
        <TabsTrigger value="saved">Saved ({savedQuestions.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="current" className="mt-0">
        {questions.length > 0 ? (
          <>
            <div className="flex justify-between mb-4">
              <div>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => setShowAddQuestion(!showAddQuestion)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveAllQuestions}>
                  <Database className="mr-2 h-4 w-4" />
                  Save All
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={resetQuestions}>
                Configure New Questions
              </Button>
            </div>
            
            {showAddQuestion && (
              <Card className="mb-6 border-dashed">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">Add New Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Question</label>
                      <Textarea 
                        placeholder="Enter your question..."
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Options (for multiple choice)</label>
                      {newQuestion.options.map((option, index) => (
                        <Input 
                          key={index}
                          className="mt-2"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion({...newQuestion, options: newOptions});
                          }}
                        />
                      ))}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Correct Answer</label>
                      <Input
                        placeholder="Enter the correct answer..."
                        value={newQuestion.correctAnswer}
                        onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Explanation (optional)</label>
                      <Textarea 
                        placeholder="Explain why this answer is correct..."
                        value={newQuestion.explanation}
                        onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowAddQuestion(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddQuestion}>
                        Add Question
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-6">
              {questions.map((question) => (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="text-lg">{question.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {question.options ? (
                      <div className="space-y-2">
                        {question.options.map((option: string) => (
                          <div 
                            key={option} 
                            className={cn(
                              "flex items-center p-3 rounded-md border cursor-pointer transition-colors",
                              question.userAnswer === option ? "bg-primary/10 border-primary" : "hover:bg-secondary"
                            )}
                            onClick={() => handleAnswerQuestion(question.id, option)}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-full mr-2 border",
                              question.userAnswer === option ? "bg-primary border-primary" : "border-muted-foreground"
                            )}></div>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Textarea 
                          placeholder="Enter your answer..." 
                          value={question.userAnswer || ""}
                          onChange={(e) => handleAnswerQuestion(question.id, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    )}
                    
                    {question.userAnswer && (
                      <div className="mt-4 p-3 rounded-md bg-muted">
                        <div className="font-medium">Correct answer: {question.correctAnswer}</div>
                        {question.explanation && (
                          <div className="mt-2 text-sm text-muted-foreground">{question.explanation}</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="border rounded-md p-6 space-y-4">
            <h3 className="text-lg font-medium">Question Configuration</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Question Type</Label>
                <Select
                  value={questionType}
                  onValueChange={setQuestionType}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiplechoice">Multiple Choice</SelectItem>
                    <SelectItem value="shortanswer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay/Long Form</SelectItem>
                    <SelectItem value="truefalse">True/False</SelectItem>
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
                <Label className="text-sm font-medium">Marks per Question</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={marksPerQuestion}
                  onChange={(e) => setMarksPerQuestion(parseInt(e.target.value))}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="question-count" className="text-sm font-medium">Number of Questions</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Slider 
                    id="question-count"
                    min={1}
                    max={20}
                    step={1}
                    value={[questionCount]}
                    onValueChange={(values) => setQuestionCount(values[0])}
                    className="flex-1" 
                  />
                  <span className="w-12 text-center font-medium">{questionCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select between 1-20 questions to generate
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Question Context (Optional)</Label>
                <Input
                  placeholder="Add subject, teacher name, or specific context for better questions..."
                  value={questionContext}
                  onChange={(e) => setQuestionContext(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: "AP Biology lesson on cell structures" or "Middle school math class"
                </p>
              </div>
              {useReferencesForAI && references && references.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm font-medium">
                      Using {references.length} references to enhance questions
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    References will be used to create more accurate and challenging questions
                  </p>
                </div>
              )}
              <Button 
                onClick={handleGenerateQuestions}
                disabled={isGeneratingQuestions || !content.trim()}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                {isGeneratingQuestions ? "Generating..." : "Generate Questions"}
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="saved" className="mt-0">
        {savedQuestions.length > 0 ? (
          <>
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSavedQuestions([]);
                  toast({
                    title: "Saved questions cleared",
                    description: "All saved questions have been removed.",
                  });
                }}
              >
                Clear Saved
              </Button>
            </div>
            
            <div className="space-y-4">
              {savedQuestions.map((question) => (
                <Card 
                  key={question.id} 
                  className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => {
                    // Add the question to current questions if not already there
                    if (!questions.some(q => q.id === question.id)) {
                      setQuestions([...questions, question]);
                      setQuestionsSubTab("current");
                      toast({
                        title: "Question loaded",
                        description: "Saved question added to current session.",
                      });
                    }
                  }}
                >
                  <CardHeader className="py-3 bg-muted/50">
                    <CardTitle className="text-sm">{question.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="text-sm font-medium">Correct answer: {question.correctAnswer}</div>
                    {question.explanation && (
                      <div className="mt-2 text-xs text-muted-foreground line-clamp-2">{question.explanation}</div>
                    )}
                  </CardContent>
                  <CardFooter className="p-3 border-t flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSavedQuestions(savedQuestions.filter(q => q.id !== question.id));
                        toast({
                          title: "Question removed",
                          description: "Question has been removed from saved items.",
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
            <h3 className="text-lg font-medium mb-2">No Saved Questions</h3>
            <p className="text-muted-foreground mb-4">
              Save some questions from your current session to access them later.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setQuestionsSubTab("current")}
            >
              Go to Current Questions
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default QuestionsTab;
