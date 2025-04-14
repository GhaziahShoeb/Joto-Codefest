import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 animate-fade-in">
      <div className="max-w-3xl text-center space-y-6">
        <div className="flex justify-center">
          <Brain className="h-16 w-16 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold">Welcome to Joto</h1>
        <p className="text-xl text-muted-foreground">Your AI-powered study assistant</p>
        
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <BookOpen className="h-10 w-10 text-primary mb-2" />
            <h3 className="text-lg font-medium">Smart Notes</h3>
            <p className="text-sm text-muted-foreground text-center">Create rich study notes with AI enhancement</p>
          </div>
          
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <BookOpen className="h-10 w-10 text-primary mb-2" />
            <h3 className="text-lg font-medium">Flashcards</h3>
            <p className="text-sm text-muted-foreground text-center">Generate flashcards directly from your notes</p>
          </div>
          
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <Lightbulb className="h-10 w-10 text-primary mb-2" />
            <h3 className="text-lg font-medium">AI Assistant</h3>
            <p className="text-sm text-muted-foreground text-center">Get help and explanations whenever you need</p>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-8">
          <Link to="/notes">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
