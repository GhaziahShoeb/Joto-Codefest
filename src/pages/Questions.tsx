
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, HelpCircle, Plus, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const questionsDemoData = [
  {
    id: 1,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
    userAnswer: null,
  },
  {
    id: 2,
    question: "What is the largest organ in the human body?",
    options: ["Brain", "Liver", "Skin", "Heart"],
    correctAnswer: "Skin",
    userAnswer: null,
  },
  {
    id: 3,
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: "William Shakespeare",
    userAnswer: null,
  },
];

const Questions = () => {
  const [questions, setQuestions] = useState(questionsDemoData);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: number, answer: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, userAnswer: answer } : q
    ));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setQuestions(questions.map(q => ({ ...q, userAnswer: null })));
    setShowResults(false);
  };

  const score = questions.filter(q => q.userAnswer === q.correctAnswer).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Practice Questions</h1>
          <p className="text-muted-foreground">Test your knowledge with practice questions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Questions
        </Button>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader>
              <CardTitle className="flex items-start gap-2">
                <HelpCircle className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                <span>{question.question}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {question.options.map((option) => (
                  <Button
                    key={option}
                    variant={question.userAnswer === option ? "default" : "outline"}
                    className={cn(
                      "justify-start text-left h-auto py-3",
                      showResults && option === question.correctAnswer && "bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300",
                      showResults && option === question.userAnswer && option !== question.correctAnswer && "bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300"
                    )}
                    onClick={() => !showResults && handleAnswer(question.id, option)}
                    disabled={showResults}
                  >
                    {option}
                    {showResults && option === question.correctAnswer && (
                      <CheckCircle className="ml-auto h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                    {showResults && option === question.userAnswer && option !== question.correctAnswer && (
                      <XCircle className="ml-auto h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="flex justify-between items-center">
        {showResults && (
          <div className="font-medium">
            Score: {score} / {questions.length}
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          {!showResults ? (
            <Button onClick={handleSubmit} disabled={!questions.every(q => q.userAnswer)}>
              Submit Answers
            </Button>
          ) : (
            <Button onClick={handleReset}>
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
