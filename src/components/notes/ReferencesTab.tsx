import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BookOpen, BookMarked, Upload, ExternalLink, Trash2, FileText, FileImage, File, Loader2, Settings, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Reference } from "@/types/notes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

// Define file size limits
const MAX_FILE_SIZE_MB = 5; // 5MB max for regular files
const MAX_FILE_SIZE_PDF_MB = 10; // 10MB max for PDFs
const MAX_TOTAL_REFERENCES_MB = 25; // 25MB combined max for all references
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILE_SIZE_PDF_BYTES = MAX_FILE_SIZE_PDF_MB * 1024 * 1024;
const MAX_TOTAL_REFERENCES_BYTES = MAX_TOTAL_REFERENCES_MB * 1024 * 1024;

interface ReferencesTabProps {
  references: Reference[];
  setReferences: (references: Reference[]) => void;
  setActiveTab: (tab: string) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  useReferencesForAI: boolean;
  setUseReferencesForAI: (use: boolean) => void;
}

/**
 * ReferencesTab component for managing reference materials
 */
const ReferencesTab = ({ 
  references, 
  setReferences,
  setActiveTab,
  setTitle,
  setContent,
  useReferencesForAI,
  setUseReferencesForAI
}: ReferencesTabProps) => {
  const { toast } = useToast();
  
  // References state
  const [newReference, setNewReference] = useState<Partial<Reference>>({
    type: 'link',
    name: '',
    description: '',
    url: '',
    priority: 1
  });
  const [addingReference, setAddingReference] = useState(false);
  const [selectedReferenceType, setSelectedReferenceType] = useState<Reference['type']>('link');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  const [processingReference, setProcessingReference] = useState(false);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [processingReferenceId, setProcessingReferenceId] = useState<number | null>(null);
  
  // Note customization state
  const [noteFormat, setNoteFormat] = useState("summary");
  const [showOptions, setShowOptions] = useState(false);
  const [customOptions, setCustomOptions] = useState({
    includeSummary: true,
    includeMainPoints: true, 
    includeFocusPages: false,
    focusLevel: 2, // 1-3: Basic, Standard, Detailed
    pageStart: 1,
    pageEnd: 999,
    customPrompt: "",
  });

  // Get theme info to apply proper styling
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Function to generate class names based on theme
  const getThemeClasses = (baseClasses: string = "") => {
    return cn(
      baseClasses,
      isDark ? "bg-[#1a1a1a] border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
    );
  };

  const getInputThemeClasses = () => {
    return cn(
      isDark ? 
        "bg-[#1a1a1a] border-gray-700 text-white focus:border-blue-500 placeholder:text-gray-500" : 
        "bg-white border-gray-200 text-gray-900 focus:border-blue-500"
    );
  };

  const getSelectThemeClasses = () => {
    return cn(
      isDark ? 
        "bg-[#1a1a1a] border-gray-700 text-white" : 
        "bg-white border-gray-200 text-gray-900"
    );
  };
  
  // Calculate total size of all reference files
  const calculateTotalReferencesSize = (): number => {
    return references.reduce((total, ref) => {
      return total + (ref.fileSize || 0);
    }, 0);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  
  // Display current usage of reference storage
  const getCurrentUsage = (): string => {
    const totalBytes = calculateTotalReferencesSize();
    const percentage = ((totalBytes / MAX_TOTAL_REFERENCES_BYTES) * 100).toFixed(1);
    return `${formatFileSize(totalBytes)} / ${MAX_TOTAL_REFERENCES_MB}MB (${percentage}%)`;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size limits
    const totalExistingSize = calculateTotalReferencesSize();
    const isPdf = file.type === 'application/pdf';
    const maxSingleFileSize = isPdf ? MAX_FILE_SIZE_PDF_BYTES : MAX_FILE_SIZE_BYTES;
    
    // Validate file size
    if (file.size > maxSingleFileSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${isPdf ? MAX_FILE_SIZE_PDF_MB : MAX_FILE_SIZE_MB}MB.`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate total references size
    if (totalExistingSize + file.size > MAX_TOTAL_REFERENCES_BYTES) {
      toast({
        title: "Total references size exceeded",
        description: `You've reached the maximum combined size of ${MAX_TOTAL_REFERENCES_MB}MB for all references.`,
        variant: "destructive",
      });
      return;
    }
    
    // Store the file in state
    setUploadedFiles({
      ...uploadedFiles,
      [selectedReferenceType]: file
    });
    
    // Update new reference state
    setNewReference({
      ...newReference,
      name: file.name,
      file: file,
      fileSize: file.size
    });
  };

  // Handle adding a new reference
  const handleAddReference = async () => {
    if (!newReference.name) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your reference.",
        variant: "destructive",
      });
      return;
    }
    
    if (newReference.type === 'link' && !newReference.url) {
      toast({
        title: "Missing URL",
        description: "Please provide a URL for your link reference.",
        variant: "destructive",
      });
      return;
    }
    
    if (['pdf', 'image', 'ppt', 'syllabus', 'other'].includes(newReference.type || '') && !newReference.file) {
      toast({
        title: "Missing file",
        description: "Please upload a file for your reference.",
        variant: "destructive",
      });
      return;
    }
    
    setProcessingReference(true);
    
    try {
      // In a real application, you would process the file here
      // For demonstration purposes, we'll just create the reference
      const newReferenceComplete: Reference = {
        id: Date.now(),
        type: newReference.type as Reference['type'],
        name: newReference.name,
        description: newReference.description || '',
        url: newReference.url || '',
        file: newReference.file,
        fileSize: newReference.fileSize || 0,
        priority: newReference.priority || 1,
        dateAdded: new Date()
      };
      
      setReferences([...references, newReferenceComplete]);
      resetReferenceForm();
      
      toast({
        title: "Reference added",
        description: "Your reference material has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding reference:", error);
      toast({
        title: "Failed to add reference",
        description: "There was an error processing your reference material.",
        variant: "destructive",
      });
    } finally {
      setProcessingReference(false);
    }
  };
  
  // Reset reference form
  const resetReferenceForm = () => {
    setNewReference({
      type: 'link',
      name: '',
      description: '',
      url: '',
      priority: 1
    });
    setSelectedReferenceType('link');
    setAddingReference(false);
    setUploadedFiles({});
  };
  
  // Delete reference
  const handleDeleteReference = (id: number) => {
    setReferences(references.filter(ref => ref.id !== id));
    toast({
      title: "Reference removed",
      description: "The reference material has been removed.",
    });
  };

  /**
   * Generate notes based on reference and format option
   */
  const generateNotes = async (reference: Reference, format: string, options: any) => {
    const nameWithoutExt = reference.name.replace(/\.(pdf|jpg|png|ppt|pptx)$/i, '');
    
    // Create base title for the notes
    let title = "";
    
    // Create formatted content based on the selected note format
    let content = "";
    
    // Generate based on format
    switch (format) {
      case "summary":
        title = `Summary: ${nameWithoutExt}`;
        content = generateSummaryFormat(reference);
        break;
        
      case "bullet-points":
        title = `Key Points: ${nameWithoutExt}`;
        content = generateBulletPointFormat(reference);
        break;
      
      case "detailed":
        title = `Detailed Notes: ${nameWithoutExt}`;
        content = generateDetailedFormat(reference, options);
        break;
      
      case "study-guide":
        title = `Study Guide: ${nameWithoutExt}`;
        content = generateStudyGuideFormat(reference);
        break;
        
      case "custom":
        title = `Notes on ${nameWithoutExt}`;
        content = generateCustomFormat(reference, options);
        break;
        
      default:
        title = `Notes on ${nameWithoutExt}`;
        content = generateSummaryFormat(reference);
    }
    
    // Wait to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { title, content };
  };
  
  /**
   * Generate summary format
   */
  const generateSummaryFormat = (reference: Reference): string => {
    const nameWithoutExt = reference.name.replace(/\.(pdf|jpg|png|ppt|pptx)$/i, '');
    
    return `<div style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Summary: ${nameWithoutExt}</div>

<div style="font-style: italic; margin-bottom: 16px;">This is a summary of the key concepts from ${reference.type} reference.</div>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Key Takeaways</div>

<ul>
  <li style="margin-bottom: 8px;">First major concept from the reference material</li>
  <li style="margin-bottom: 8px;">Second important point covered in the document</li>
  <li style="margin-bottom: 8px;">Third significant finding or insight</li>
  <li style="margin-bottom: 8px;">Fourth critical element for understanding the topic</li>
</ul>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Core Concepts</div>

<div style="margin-bottom: 16px;">
  The reference material presents several important concepts that are central to understanding ${nameWithoutExt}. These concepts build upon each other to create a comprehensive framework.
</div>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Conclusion</div>

<div style="margin-bottom: 16px;">
  This reference provides valuable insights into the subject matter and establishes a foundation for further exploration and application.
</div>`;
  };
  
  /**
   * Generate bullet point format
   */
  const generateBulletPointFormat = (reference: Reference): string => {
    const nameWithoutExt = reference.name.replace(/\.(pdf|jpg|png|ppt|pptx)$/i, '');
    
    return `<div style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Key Points: ${nameWithoutExt}</div>

<div style="margin-bottom: 16px;">
  <span style="font-weight: bold;">Reference Type:</span> ${reference.type}
  ${reference.description ? `<br><span style="font-weight: bold;">Description:</span> ${reference.description}` : ''}
</div>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Main Topics</div>

<ul>
  <li style="margin-bottom: 8px;">
    <span style="font-weight: bold;">Topic 1</span>
    <ul>
      <li>Subtopic 1.1</li>
      <li>Subtopic 1.2</li>
    </ul>
  </li>
  <li style="margin-bottom: 8px;">
    <span style="font-weight: bold;">Topic 2</span>
    <ul>
      <li>Subtopic 2.1</li>
      <li>Subtopic 2.2</li>
    </ul>
  </li>
  <li style="margin-bottom: 8px;">
    <span style="font-weight: bold;">Topic 3</span>
    <ul>
      <li>Subtopic 3.1</li>
      <li>Subtopic 3.2</li>
    </ul>
  </li>
</ul>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Key Terminology</div>

<ul>
  <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Term 1:</span> Definition of the first important term</li>
  <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Term 2:</span> Definition of the second important term</li>
  <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Term 3:</span> Definition of the third important term</li>
</ul>`;
  };
  
  /**
   * Generate detailed format
   */
  const generateDetailedFormat = (reference: Reference, options: any): string => {
    const nameWithoutExt = reference.name.replace(/\.(pdf|jpg|png|ppt|pptx)$/i, '');
    
    const includePageRange = options.includeFocusPages && reference.type === 'pdf';
    const pageRangeText = includePageRange 
      ? ` (Pages ${options.pageStart}-${options.pageEnd})`
      : '';
    
    return `<div style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Detailed Notes: ${nameWithoutExt}${pageRangeText}</div>

<div style="font-style: italic; margin-bottom: 16px;">Comprehensive examination of the reference material</div>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Introduction</div>

<div style="margin-bottom: 16px;">
  This analysis explores the concepts, methodologies, and applications presented in ${nameWithoutExt}. The material covers ${reference.description || 'the subject matter'} in depth, providing both theoretical foundations and practical implementations.
</div>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Core Concepts</div>

<div style="font-size: 18px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">Concept 1</div>
<div style="margin-bottom: 16px;">
  Detailed explanation of the first major concept, including its origins, development, and significance within the field. This concept forms the foundation for understanding subsequent material in the reference.
</div>
<div style="margin-bottom: 16px;">
  Further elaboration on applications and implications of this concept in various contexts, including examples and case studies that demonstrate its practical relevance.
</div>

<div style="font-size: 18px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">Concept 2</div>
<div style="margin-bottom: 16px;">
  Comprehensive coverage of the second key concept, including its relationship to the first concept and how they work together within the broader framework of the subject.
</div>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Methodological Framework</div>

<div style="margin-bottom: 16px;">Analysis of the methodological approaches outlined in the reference, including:</div>

<ol>
  <li style="margin-bottom: 8px;">Fundamental principles guiding the methodology</li>
  <li style="margin-bottom: 8px;">Step-by-step procedures for implementation</li>
  <li style="margin-bottom: 8px;">Evaluation criteria and quality assurance measures</li>
</ol>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Critical Analysis</div>

<div style="margin-left: 24px; padding-left: 16px; border-left: 4px solid #808080; font-style: italic; margin-bottom: 16px;">
  "Significant quote from the reference that encapsulates a key insight or principle."
</div>

<div style="margin-bottom: 16px;">
  Evaluation of the strengths and limitations of the material presented in ${nameWithoutExt}, including areas of consensus and ongoing debates in the field.
</div>`;
  };
  
  /**
   * Generate study guide format
   */
  const generateStudyGuideFormat = (reference: Reference): string => {
    const nameWithoutExt = reference.name.replace(/\.(pdf|jpg|png|ppt|pptx)$/i, '');
    
    return `<div style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Study Guide: ${nameWithoutExt}</div>

<div style="font-style: italic; margin-bottom: 16px;">A focused study guide based on ${reference.type} reference</div>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Learning Objectives</div>

<div style="margin-bottom: 8px;">After studying this material, you should be able to:</div>
<ul>
  <li style="margin-bottom: 8px;">Understand and explain the core concepts presented in ${nameWithoutExt}</li>
  <li style="margin-bottom: 8px;">Apply key methodologies to relevant problems and scenarios</li>
  <li style="margin-bottom: 8px;">Analyze and evaluate different approaches within the context of the subject matter</li>
  <li style="margin-bottom: 8px;">Synthesize information from multiple sources to form a cohesive understanding</li>
</ul>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Essential Concepts to Master</div>

<ol>
  <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Concept 1:</span> Brief explanation and importance</li>
  <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Concept 2:</span> Brief explanation and importance</li>
  <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Concept 3:</span> Brief explanation and importance</li>
  <li style="margin-bottom: 8px;"><span style="font-weight: bold;">Concept 4:</span> Brief explanation and importance</li>
</ol>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Study Questions</div>

<ol>
  <li style="margin-bottom: 8px;">How does [key concept] relate to [another concept] within the framework presented?</li>
  <li style="margin-bottom: 8px;">What are the primary advantages and limitations of the methodologies described?</li>
  <li style="margin-bottom: 8px;">How would you apply the principles discussed to solve [specific type of problem]?</li>
  <li style="margin-bottom: 8px;">Compare and contrast the different approaches outlined in the reference.</li>
  <li style="margin-bottom: 8px;">What evidence supports the main claims made in the reference material?</li>
</ol>

<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Study Strategy</div>

<ol>
  <li style="margin-bottom: 8px;">First, review the key terminology and ensure you understand each definition.</li>
  <li style="margin-bottom: 8px;">Study the core concepts in depth, making connections between related ideas.</li>
  <li style="margin-bottom: 8px;">Practice applying the concepts to different scenarios and problems.</li>
  <li style="margin-bottom: 8px;">Create flashcards for testing recall of important information.</li>
  <li style="margin-bottom: 8px;">Discuss the material with others to deepen understanding through explanation.</li>
</ol>`;
  };
  
  /**
   * Generate custom format based on options
   */
  const generateCustomFormat = (reference: Reference, options: any): string => {
    const nameWithoutExt = reference.name.replace(/\.(pdf|jpg|png|ppt|pptx)$/i, '');
    let content = `<div style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Notes on ${nameWithoutExt}</div>`;
    
    // Add reference information
    content += `<div style="margin-bottom: 16px;">
  <span style="font-weight: bold;">Reference Type:</span> ${reference.type}
  ${reference.description ? `<br><span style="font-weight: bold;">Description:</span> ${reference.description}` : ''}
  ${reference.url ? `<br><span style="font-weight: bold;">URL:</span> <a href="${reference.url}">${reference.url}</a>` : ''}
</div>`;
    
    // Add custom prompt if provided
    if (options.customPrompt) {
      content += `<div style="font-style: italic; margin-bottom: 16px; padding: 8px; background-color: #f0f0f0; border-radius: 4px;">
  Focus area: ${options.customPrompt}
</div>`;
    }
    
    // Add page range if selected for PDFs
    if (options.includeFocusPages && reference.type === 'pdf') {
      content += `<div style="margin-bottom: 16px;">
  <span style="font-weight: bold;">Page Range:</span> ${options.pageStart} - ${options.pageEnd}
</div>`;
    }
    
    // Add summary if selected
    if (options.includeSummary) {
      content += `<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Summary</div>
<div style="margin-bottom: 16px;">
  ${nameWithoutExt} provides a comprehensive exploration of key concepts and methodologies related to ${reference.description || 'the subject matter'}. The material presents both theoretical frameworks and practical applications to support understanding and implementation.
</div>`;
    }
    
    // Add main points if selected
    if (options.includeMainPoints) {
      content += `<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Main Points</div>
<ul>`;
      
      // Generate more points for higher focus levels
      const numPoints = options.focusLevel === 1 ? 3 : options.focusLevel === 2 ? 5 : 7;
      
      for (let i = 1; i <= numPoints; i++) {
        content += `
  <li style="margin-bottom: 8px;">Key point ${i}: ${generateFakePointContent(nameWithoutExt, i, options.focusLevel)}</li>`;
      }
      
      content += `
</ul>`;
    }
    
    // Add depth based on focus level
    if (options.focusLevel >= 2) {
      content += `<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Detailed Analysis</div>
<div style="margin-bottom: 16px;">
  The material presents a structured approach to understanding ${nameWithoutExt}, with clear connections between theoretical frameworks and practical applications. Key methodologies are explained with supporting examples that demonstrate real-world relevance.
</div>`;
      
      if (options.focusLevel >= 3) {
        content += `<div style="font-size: 18px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">Advanced Concepts</div>
<div style="margin-bottom: 16px;">
  Beyond the fundamental principles, the reference explores advanced concepts that represent current developments in the field. These include emerging methodologies, innovative applications, and areas of ongoing research and debate.
</div>
<div style="margin-left: 24px; padding-left: 16px; border-left: 4px solid #808080; font-style: italic; margin-bottom: 16px;">
  "Important insight from the reference that highlights a sophisticated understanding of the subject matter."
</div>`;
      }
    }
    
    // Conclusion
    content += `<div style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 8px;">Conclusion</div>
<div style="margin-bottom: 16px;">
  This reference provides valuable insights into ${nameWithoutExt}, establishing a foundation for understanding key concepts and applications. The material is structured to support progressive learning and practical implementation.
</div>`;
    
    return content;
  };
  
  /**
   * Helper to generate fake content for points
   */
  const generateFakePointContent = (topic: string, pointNumber: number, detailLevel: number): string => {
    const topics = ["methodology", "framework", "approach", "concept", "principle", "theory"];
    const topic1 = topics[pointNumber % topics.length];
    const topic2 = topics[(pointNumber + 2) % topics.length];
    
    if (detailLevel === 1) {
      return `Brief overview of a key ${topic1} related to ${topic}`;
    } else if (detailLevel === 2) {
      return `Description of an important ${topic1}, including its relationship to the ${topic2} and practical applications`;
    } else {
      return `In-depth analysis of the ${topic1}, examining theoretical foundations, practical implementations, and connections to other ${topic2}s within the broader field`;
    }
  };
  
  /**
   * Generate notes from a reference
   */
  const handleUseReference = async (reference: Reference) => {
    setProcessingReferenceId(reference.id);
    setGeneratingNotes(true);
    
    try {
      // Generate notes based on the selected format and options
      const { title, content } = await generateNotes(
        reference, 
        noteFormat, 
        customOptions
      );
      
      setTitle(title);
      setContent(content);
      setActiveTab("editor");
      
      toast({
        title: "Notes generated",
        description: `Notes based on "${reference.name}" are ready for editing.`,
      });
    } catch (error) {
      console.error("Error generating notes:", error);
      toast({
        title: "Error generating notes",
        description: "There was a problem processing your reference.",
        variant: "destructive",
      });
    } finally {
      setGeneratingNotes(false);
      setProcessingReferenceId(null);
    }
  };
  
  /**
   * Generate notes from all references
   */
  const handleGenerateFromReferences = async () => {
    if (references.length === 0) {
      toast({
        title: "No references available",
        description: "Add some references first to use this feature.",
        variant: "destructive",
      });
      return;
    }
    
    setGeneratingNotes(true);
    
    try {
      const sortedReferences = [...references].sort((a, b) => b.priority - a.priority);
      const mainReference = sortedReferences[0];
      
      const { title, content } = await generateNotes(
        mainReference,
        noteFormat === "custom" ? "summary" : noteFormat,
        customOptions
      );
      
      let combinedContent = content;
      
      // For multiple references, add a section from each additional reference
      if (sortedReferences.length > 1) {
        combinedContent += `
<div style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
  <div style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">Additional References</div>
</div>`;

        // Process up to 4 additional references
        const additionalRefs = sortedReferences.slice(1, 5);
        
        for (const ref of additionalRefs) {
          const nameWithoutExt = ref.name.replace(/\.(pdf|jpg|png|ppt|pptx)$/i, '');
          
          combinedContent += `
<div style="margin-top: 24px; margin-bottom: 8px;">
  <div style="font-size: 18px; font-weight: bold;">${nameWithoutExt}</div>
  <div style="font-style: italic; margin-bottom: 8px;">${ref.type} reference${ref.description ? `: ${ref.description}` : ''}</div>
</div>

<div style="margin-bottom: 16px;">Key points from this reference:</div>
<ul>
  <li style="margin-bottom: 8px;">Main concept from ${nameWithoutExt}</li>
  <li style="margin-bottom: 8px;">Supporting detail or methodology</li>
  <li style="margin-bottom: 8px;">Connection to the primary reference material</li>
</ul>`;
        }
        
        // Note if there are more references not processed
        if (sortedReferences.length > 5) {
          const remaining = sortedReferences.length - 5;
          combinedContent += `
<div style="margin-top: 16px; font-style: italic;">
  ${remaining} additional reference${remaining > 1 ? 's' : ''} not processed. Consider reviewing them separately for more complete information.
</div>`;
        }
      }
      
      setTitle(title);
      setContent(combinedContent);
      setActiveTab("editor");
      
      toast({
        title: "Notes generated",
        description: `Combined notes from ${Math.min(sortedReferences.length, 5)} references are ready.`,
      });
      
    } catch (error) {
      console.error("Error generating combined notes:", error);
      toast({
        title: "Error generating notes",
        description: "There was a problem processing your references.",
        variant: "destructive",
      });
    } finally {
      setGeneratingNotes(false);
    }
  };

  // Add checkbox for using references with AI
  const handleToggleUseReferencesForAI = (checked: boolean) => {
    setUseReferencesForAI(checked);
    
    toast({
      title: checked ? "References enabled for AI" : "References disabled for AI",
      description: checked 
        ? "AI will now use your references when generating content" 
        : "AI will no longer use your references when generating content"
    });
  };

  /**
   * Generate notes from all references combined
   */
  const handleGenerateNotes = async () => {
    if (references.length === 0) {
      toast({
        title: "No references available",
        description: "Add some references first to use this feature.",
        variant: "destructive",
      });
      return;
    }
    
    setGeneratingNotes(true);
    
    try {
      // Generate notes from all references
      const sortedReferences = [...references].sort((a, b) => b.priority - a.priority);
      const mainReference = sortedReferences[0];
      
      const { title, content } = await generateNotes(
        mainReference,
        noteFormat,
        customOptions
      );
      
      setTitle(title);
      setContent(content);
      setActiveTab("editor");
      
      toast({
        title: "Notes generated",
        description: `Notes from reference "${mainReference.name}" are ready for editing.`,
      });
    } catch (error) {
      console.error("Error generating notes:", error);
      toast({
        title: "Error generating notes",
        description: "There was a problem processing your references.",
        variant: "destructive",
      });
    } finally {
      setGeneratingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI References Toggle */}
      <Card className={cn("mb-4", isDark && "bg-gray-900 border-gray-700")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">AI References Integration</CardTitle>
            <Switch 
              checked={useReferencesForAI} 
              onCheckedChange={setUseReferencesForAI}
              id="references-toggle"
            />
          </div>
          <CardDescription className={isDark ? "text-gray-400" : ""}>
            Toggle whether references should be included in AI-generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert variant={useReferencesForAI ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {useReferencesForAI ? 
                  "References Enabled" : 
                  "References Disabled"}
              </AlertTitle>
              <AlertDescription>
                {useReferencesForAI ? 
                  "AI will use your references to enhance generated content. This can improve accuracy and relevance." : 
                  "AI will not consider your references when generating content. You can enable this feature to get more relevant results."}
              </AlertDescription>
            </Alert>
            
            <div className="text-sm text-muted-foreground">
              <p>When enabled, references will be used for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Note beautification and enhancement</li>
                <li>Flashcard generation</li>
                <li>Question generation</li>
                <li>AI assistant responses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* References Management Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">References ({references.length})</h2>
        <Button onClick={() => setAddingReference(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Reference
        </Button>
      </div>

      {/* Reference form */}
      {addingReference && (
        <Card className={cn("mb-6", isDark && "bg-gray-900 border-gray-700")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Add New Reference</CardTitle>
            <CardDescription className={isDark ? "text-gray-400" : ""}>
              Add study materials that the AI can use to create personalized notes, flashcards, and questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reference Type</label>
              <select 
                className={getSelectThemeClasses()}
                value={selectedReferenceType}
                onChange={(e) => {
                  setSelectedReferenceType(e.target.value as Reference['type']);
                  setNewReference({
                    ...newReference,
                    type: e.target.value as Reference['type']
                  });
                }}
              >
                <option value="link">Web Link</option>
                <option value="pdf">PDF Document</option>
                <option value="image">Image</option>
                <option value="ppt">Presentation</option>
                <option value="syllabus">Syllabus/Exam Guidelines</option>
                <option value="other">Other Document</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Enter a name for this reference"
                value={newReference.name}
                onChange={(e) => setNewReference({
                  ...newReference,
                  name: e.target.value
                })}
                className={getInputThemeClasses()}
              />
            </div>
            
            {selectedReferenceType === 'link' ? (
              <div>
                <label className="text-sm font-medium">URL</label>
                <Input
                  placeholder="https://example.com"
                  value={newReference.url}
                  onChange={(e) => setNewReference({
                    ...newReference,
                    url: e.target.value
                  })}
                  className={getInputThemeClasses()}
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Upload File</label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={
                      selectedReferenceType === 'pdf' ? ".pdf" :
                      selectedReferenceType === 'image' ? "image/*" :
                      selectedReferenceType === 'ppt' ? ".ppt,.pptx" :
                      ".pdf,.doc,.docx,.txt"
                    }
                    onChange={handleFileUpload}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
                {uploadedFiles[selectedReferenceType] && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {uploadedFiles[selectedReferenceType].name} 
                    ({formatFileSize(uploadedFiles[selectedReferenceType].size)})
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Max file size: {selectedReferenceType === 'pdf' ? MAX_FILE_SIZE_PDF_MB : MAX_FILE_SIZE_MB}MB
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                placeholder="Add notes about this reference material..."
                value={newReference.description}
                onChange={(e) => setNewReference({
                  ...newReference,
                  description: e.target.value
                })}
                className={getInputThemeClasses()}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Priority Level</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={newReference.priority}
                  onChange={(e) => setNewReference({
                    ...newReference,
                    priority: parseInt(e.target.value)
                  })}
                  className="flex-1" 
                />
                <span className="w-12 text-center font-medium">{newReference.priority}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Higher priority references will be given more weight by the AI
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetReferenceForm}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddReference}
              disabled={processingReference}
            >
              {processingReference ? "Processing..." : "Add Reference"}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Note format options */}
      {references.length > 0 && !addingReference && (
        <Card className={cn("mb-4", isDark && "bg-gray-900 border-gray-700")}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Note Generation Options</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowOptions(!showOptions)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showOptions ? "Hide Options" : "Show Options"}
              </Button>
            </div>
            <CardDescription className={isDark ? "text-gray-400" : ""}>
              Choose how you want to generate notes from your references
            </CardDescription>
          </CardHeader>
          
          {showOptions && (
            <CardContent>
              <div className="space-y-6">
                {/* Format selection */}
                <div className="space-y-2">
                  <Label>Note Format</Label>
                  <RadioGroup 
                    value={noteFormat} 
                    onValueChange={setNoteFormat}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className={cn(
                      "flex items-start space-x-2 p-3 rounded-md border",
                      isDark ? "border-gray-700" : "border-gray-200"
                    )}>
                      <RadioGroupItem value="summary" id="summary" />
                      <Label htmlFor="summary" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Summary</span>
                        <span className={cn("text-xs", isDark ? "text-gray-400" : "text-muted-foreground")}>
                          Brief overview of key points
                        </span>
                      </Label>
                    </div>
                    
                    <div className={cn(
                      "flex items-start space-x-2 p-3 rounded-md border",
                      isDark ? "border-gray-700" : "border-gray-200"
                    )}>
                      <RadioGroupItem value="bullet-points" id="bullet-points" />
                      <Label htmlFor="bullet-points" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Bullet Points</span>
                        <span className={cn("text-xs", isDark ? "text-gray-400" : "text-muted-foreground")}>
                          Organized lists of information
                        </span>
                      </Label>
                    </div>
                    
                    <div className={cn(
                      "flex items-start space-x-2 p-3 rounded-md border",
                      isDark ? "border-gray-700" : "border-gray-200"
                    )}>
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Detailed Analysis</span>
                        <span className={cn("text-xs", isDark ? "text-gray-400" : "text-muted-foreground")}>
                          In-depth exploration of concepts
                        </span>
                      </Label>
                    </div>
                    
                    <div className={cn(
                      "flex items-start space-x-2 p-3 rounded-md border",
                      isDark ? "border-gray-700" : "border-gray-200"
                    )}>
                      <RadioGroupItem value="study-guide" id="study-guide" />
                      <Label htmlFor="study-guide" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Study Guide</span>
                        <span className={cn("text-xs", isDark ? "text-gray-400" : "text-muted-foreground")}>
                          Learning objectives and practice questions
                        </span>
                      </Label>
                    </div>
                    
                    <div className={cn(
                      "flex items-start space-x-2 p-3 rounded-md border",
                      isDark ? "border-gray-700" : "border-gray-200"
                    )}>
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="flex flex-col cursor-pointer">
                        <span className="font-medium">Custom</span>
                        <span className={cn("text-xs", isDark ? "text-gray-400" : "text-muted-foreground")}>
                          Define your own note structure
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Custom options */}
                {noteFormat === "custom" && (
                  <div className={cn(
                    "space-y-4 border rounded-md p-4",
                    isDark ? "border-gray-700" : "border-gray-200"
                  )}>
                    <h4 className="font-medium">Custom Options</h4>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeSummary" 
                            checked={customOptions.includeSummary}
                            onCheckedChange={(checked) => 
                              setCustomOptions({...customOptions, includeSummary: !!checked})
                            }
                          />
                          <Label htmlFor="includeSummary">Include Summary</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeMainPoints" 
                            checked={customOptions.includeMainPoints}
                            onCheckedChange={(checked) => 
                              setCustomOptions({...customOptions, includeMainPoints: !!checked})
                            }
                          />
                          <Label htmlFor="includeMainPoints">Include Main Points</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="includeFocusPages" 
                            checked={customOptions.includeFocusPages}
                            onCheckedChange={(checked) => 
                              setCustomOptions({...customOptions, includeFocusPages: !!checked})
                            }
                          />
                          <Label htmlFor="includeFocusPages">Focus on Specific Pages (PDFs only)</Label>
                        </div>
                      </div>
                      
                      {customOptions.includeFocusPages && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            className={cn("w-20", getInputThemeClasses())}
                            value={customOptions.pageStart}
                            onChange={(e) => 
                              setCustomOptions({
                                ...customOptions, 
                                pageStart: parseInt(e.target.value) || 1
                              })
                            }
                          />
                          <span>to</span>
                          <Input
                            type="number"
                            min={1}
                            className={cn("w-20", getInputThemeClasses())}
                            value={customOptions.pageEnd}
                            onChange={(e) => 
                              setCustomOptions({
                                ...customOptions, 
                                pageEnd: parseInt(e.target.value) || 999
                              })
                            }
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Detail Level</Label>
                          <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                            {customOptions.focusLevel === 1 ? "Basic" : 
                             customOptions.focusLevel === 2 ? "Standard" : "Detailed"}
                          </span>
                        </div>
                        <Slider
                          min={1}
                          max={3}
                          step={1}
                          value={[customOptions.focusLevel]}
                          onValueChange={(value) => 
                            setCustomOptions({...customOptions, focusLevel: value[0]})
                          }
                          className={isDark && "bg-gray-700"}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Custom Focus (Optional)</Label>
                        <Input
                          placeholder="E.g., Focus on machine learning algorithms"
                          value={customOptions.customPrompt}
                          onChange={(e) => 
                            setCustomOptions({
                              ...customOptions, 
                              customPrompt: e.target.value
                            })
                          }
                          className={getInputThemeClasses()}
                        />
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-muted-foreground")}>
                          Tell the AI what specific aspect of the reference to focus on
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
      
      {/* References grid */}
      {references.length > 0 ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {references.map((ref) => (
              <Card key={ref.id} className={cn("reference-card", isDark && "bg-gray-900 border-gray-700")}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {ref.type === 'link' && <ExternalLink className="h-5 w-5 text-blue-500" />}
                      {ref.type === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
                      {ref.type === 'image' && <FileImage className="h-5 w-5 text-green-500" />}
                      {ref.type === 'ppt' && <File className="h-5 w-5 text-orange-500" />}
                      {ref.type === 'syllabus' && <BookMarked className="h-5 w-5 text-purple-500" />}
                      {ref.type === 'other' && <File className="h-5 w-5 text-gray-500" />}
                      <CardTitle className="text-base truncate">{ref.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleDeleteReference(ref.id)}
                        disabled={processingReferenceId === ref.id || generatingNotes}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="flex items-center justify-between mt-1">
                    <span className="capitalize">{ref.type}</span>
                    <span className="text-xs">
                      Priority: {Array(ref.priority).fill('★').join('')}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ref.description || "No description provided"}
                  </p>
                  {ref.url && (
                    <a 
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-2 block truncate"
                    >
                      {ref.url}
                    </a>
                  )}
                  {ref.file && (
                    <p className="text-xs text-muted-foreground mt-2">
                      File: {ref.file.name} ({formatFileSize(ref.fileSize || 0)})
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleUseReference(ref)}
                    disabled={processingReferenceId === ref.id || generatingNotes}
                  >
                    {processingReferenceId === ref.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Create Notes from Reference
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerateFromReferences}
              disabled={generatingNotes}
            >
              {generatingNotes ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Notes...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate Notes From All References
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        !addingReference && (
          <div className={cn(
            "text-center py-12 border rounded-md",
            isDark ? "border-gray-700" : "border-gray-200"
          )}>
            <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Reference Materials Added</h3>
            <p className={cn("text-muted-foreground mb-6 max-w-md mx-auto", isDark ? "text-gray-400" : "text-muted-foreground")}>
              Add links, PDFs, presentations, or syllabus documents to help the AI create 
              more accurate and personalized content for your study needs.
            </p>
            <Button onClick={() => setAddingReference(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Reference
            </Button>
          </div>
        )
      )}
      
      {/* Actions */}
      {references.length > 0 && !addingReference && (
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleGenerateNotes}
            disabled={generatingNotes || references.length === 0}
          >
            {generatingNotes ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Notes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReferencesTab;