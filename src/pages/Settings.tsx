import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Brain, Download, Upload, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/ai-service";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"untested" | "success" | "failed">("untested");
  const { toast } = useToast();

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setConnectionStatus("untested");
    }
  }, []);
  
  const handleSaveApiKey = () => {
    if (apiKey) {
      localStorage.setItem("gemini-api-key", apiKey);
      toast({
        title: "API key saved",
        description: "Your Gemini API key has been saved successfully.",
      });
    } else {
      localStorage.removeItem("gemini-api-key");
      toast({
        title: "API key removed",
        description: "Your Gemini API key has been removed.",
      });
    }
  };
  
  const handleTestConnection = async () => {
    if (!apiKey) {
      toast({
        title: "API key required",
        description: "Please enter your Gemini API key first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsTesting(true);
    setConnectionStatus("untested");
    
    try {
      const result = await aiService.testConnection();
      if (result) {
        setConnectionStatus("success");
        toast({
          title: "Connection successful",
          description: "Successfully connected to Gemini API.",
        });
      }
    } catch (error) {
      setConnectionStatus("failed");
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect to Gemini API.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Customize your Joto experience</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how Joto looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <div className="text-xs text-muted-foreground">
                  Choose your preferred theme
                </div>
              </div>
              <ThemeToggle />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="font">Font Style</Label>
              <Select defaultValue="inter">
                <SelectTrigger id="font">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="openSans">Open Sans</SelectItem>
                  <SelectItem value="lato">Lato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Save Preferences</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Configure your AI assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Gemini API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={isVisible ? "text" : "password"}
                    placeholder="Enter your Gemini API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setIsVisible(!isVisible)}
                  >
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleSaveApiKey}>Save</Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable AI Suggestions</Label>
                <div className="text-xs text-muted-foreground">
                  Get suggestions while writing notes
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Generate Flashcards</Label>
                <div className="text-xs text-muted-foreground">
                  Automatically create flashcards from your notes
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="model">AI Response Style</Label>
              <Select defaultValue="balanced">
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select AI style" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="precise">Precise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : connectionStatus === "success" ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
              ) : connectionStatus === "failed" ? (
                <X className="mr-2 h-4 w-4 text-red-500" />
              ) : (
                <Brain className="mr-2 h-4 w-4" />
              )}
              {isTesting ? "Testing Connection..." : "Test AI Connection"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your study data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
              <Button variant="outline" className="flex-1">
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="storage">Storage Usage</Label>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-1/3 rounded-full"></div>
              </div>
              <p className="text-xs text-muted-foreground">33% of your storage used</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" className="w-full">Clear All Data</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
