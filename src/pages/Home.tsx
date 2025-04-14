import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Book, Brain, Sparkles, Lightbulb, FileQuestion, 
  Bot, Upload, ExternalLink, PenTool
} from "lucide-react";
import { motion } from "framer-motion";
import jotoLogo from "@/assets/joto_logo.png";

const Home = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="py-20 px-4 md:py-32 text-center relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 to-white dark:from-sky-950 dark:to-background -z-10 rounded-b-3xl"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <img src={jotoLogo} alt="Joto Logo" className="w-48 h-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-sky-500 mb-4">Joto</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your AI-powered study companion that makes learning smarter, not harder
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-600 text-white gap-2">
              <Link to="/notes">
                <PenTool className="h-5 w-5" />
                Start Taking Notes
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/assistant">
                <Brain className="h-5 w-5" />
                Try AI Assistant
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Features That Make Studying Effortless</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Joto combines the power of AI with intuitive design to transform how you study and learn
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {/* Feature 1 */}
            <motion.div variants={item} className="bg-background border rounded-xl p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center mb-4">
                <Book className="h-6 w-6 text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Note-Taking</h3>
              <p className="text-muted-foreground">
                Create rich, organized notes with AI assistance. Structure content automatically and enhance your writing.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={item} className="bg-background border rounded-xl p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flashcard Generator</h3>
              <p className="text-muted-foreground">
                Turn your notes into effective study flashcards with a single click. AI identifies key concepts automatically.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={item} className="bg-background border rounded-xl p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center mb-4">
                <FileQuestion className="h-6 w-6 text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Practice Questions</h3>
              <p className="text-muted-foreground">
                Generate custom questions based on your notes to test your knowledge and prepare for exams.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={item} className="bg-background border rounded-xl p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Study Companion</h3>
              <p className="text-muted-foreground">
                Ask questions, get explanations, and receive personalized study assistance from our AI tutor.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={item} className="bg-background border rounded-xl p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reference Materials</h3>
              <p className="text-muted-foreground">
                Upload PDFs, images, and documents as references. The AI will help extract and organize key information.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div variants={item} className="bg-background border rounded-xl p-6 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-sky-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Note Beautifier</h3>
              <p className="text-muted-foreground">
                Transform plain text into beautifully formatted notes with proper structure, headings, and emphasis.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg my-8 mx-4 md:mx-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to transform your study experience?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of students who are using Joto to study smarter, not harder.
            </p>
            <Button asChild size="lg" className="bg-sky-500 hover:bg-sky-600">
              <Link to="/notes">Get Started for Free</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2">
              <img src={jotoLogo} alt="Joto Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold text-sky-500">Joto</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your AI-powered study companion
            </p>
          </div>
          
          <div className="flex gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} Joto. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
