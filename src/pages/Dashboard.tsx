import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Book, Lightbulb, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome to Joto</h1>
        <p className="text-muted-foreground">Your AI-powered study assistant</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              Notes
            </CardTitle>
            <CardDescription>Create and manage your study notes</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm">Organize your learning with rich text notes, flashcards, and practice questions</p>
          </CardContent>
          <CardFooter>
            <Link to="/notes">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Create Note
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              AI Assistant
            </CardTitle>
            <CardDescription>Get help with your studies</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm">Ask questions, generate content, and get explanations from your AI assistant</p>
          </CardContent>
          <CardFooter>
            <Link to="/assistant">
              <Button className="w-full">
                <Lightbulb className="mr-2 h-4 w-4" /> Open Assistant
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
