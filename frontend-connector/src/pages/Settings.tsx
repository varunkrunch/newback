import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Info, Save, Mic, Settings as SettingsIcon, Leaf, Plus, MoreHorizontal, Loader2, Edit, Trash2, X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { transformationsAPI, podcastsAPI, modelsAPI } from "@/services/api";
import type { Transformation, PodcastTemplate } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ModelsTab from "@/components/ModelsTab";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Podcast Template Form State
  const [templateName, setTemplateName] = useState("");
  const [podcastName, setPodcastName] = useState("");
  const [podcastTagline, setPodcastTagline] = useState("");
  const [language, setLanguage] = useState("");
  const [person1Roles, setPerson1Roles] = useState<string[]>([]);
  const [person2Roles, setPerson2Roles] = useState<string[]>([]);
  const [conversationStyle, setConversationStyle] = useState<string[]>([]);
  const [engagementTechniques, setEngagementTechniques] = useState<string[]>([]);
  const [dialogueStructure, setDialogueStructure] = useState<string[]>([]);
  const [creativity, setCreativity] = useState([0.0]);
  const [endingMessage, setEndingMessage] = useState("Thank you for listening!");
  const [transcriptModelProvider, setTranscriptModelProvider] = useState("openai");
  const [transcriptModel, setTranscriptModel] = useState("gpt-4o-mini");
  const [audioModelProvider, setAudioModelProvider] = useState("");
  const [audioModel, setAudioModel] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [existingTemplates, setExistingTemplates] = useState<PodcastTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [savingTemplateEdit, setSavingTemplateEdit] = useState<string | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [voice1, setVoice1] = useState("");
  const [voice2, setVoice2] = useState("");
  const [userInstructions, setUserInstructions] = useState("");

  // Transformations State
  const [transformationType, setTransformationType] = useState("Prompt");
  const [newPromptTemplate, setNewPromptTemplate] = useState(`TRANSFORMATIONS:
You are an expert at [your role]. Your task is to [your task]. You will be given [input]. You must [output requirements].

CONSTRAINTS:
- [constraint 1]
- [constraint 2]
- [constraint 3]

EXAMPLE:
Input: [example input]
Output: [example output]`);
  const [selectedTransformation, setSelectedTransformation] = useState("Analyze Paper");
  const [transformationDescription, setTransformationDescription] = useState("");
  const [transformationPrompt, setTransformationPrompt] = useState("");
  const [expandedTransformation, setExpandedTransformation] = useState<string | null>(null);
  const [transformationName, setTransformationName] = useState("Analyze Paper");
  const [cardTitle, setCardTitle] = useState("Analyze Paper");
  const [showNewTransformationForm, setShowNewTransformationForm] = useState(false);
  const [newTransformationName, setNewTransformationName] = useState("New Tranformation");
  const [newTransformationCardTitle, setNewTransformationCardTitle] = useState("New Transformation Title");
  const [newTransformationDescription, setNewTransformationDescription] = useState("New Transformation Description");
  const [newTransformationPrompt, setNewTransformationPrompt] = useState("New Transformation Prompt");
  const [userTransformations, setUserTransformations] = useState<Array<{
    id: string;
    name: string;
    description: string;
    prompt: string;
  }>>([]);
  
  // Transformations from API
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loadingTransformations, setLoadingTransformations] = useState(true);
  const [errorTransformations, setErrorTransformations] = useState<string | null>(null);
  const [transformationsUpdateCounter, setTransformationsUpdateCounter] = useState(0);
  
  // Editing state for transformations
  const [editingTransformation, setEditingTransformation] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    title: string;
    description: string;
    prompt: string;
  }>({
    name: '',
    title: '',
    description: '',
    prompt: ''
  });
  const [savingTransformation, setSavingTransformation] = useState<string | null>(null);
  const [deletingTransformation, setDeletingTransformation] = useState<string | null>(null);
  const [settingDefaultTransformation, setSettingDefaultTransformation] = useState<string | null>(null);

  // Role suggestions
  const roleSuggestions = [
    "Main Summarizer", "Questioner/Clarifier", "Optimist", "Skeptic", "Specialist", 
    "Thesis Presenter", "Counterargument Provider", "Professor", "Student", "Moderator", 
    "Host", "Co-host", "Expert Guest", "Novice", "Devil's Advocate", "Analyst", 
    "Storyteller", "Fact-checker", "Comedian", "Interviewer", "Interviewee", "Historian", 
    "Visionary", "Strategist", "Critic", "Enthusiast", "Mediator", "Commentator", 
    "Researcher", "Reporter", "Advocate", "Debater", "Explorer"
  ];

  const conversationStyleSuggestions = [
    "Analytical", "Argumentative", "Informative", "Humorous", "Casual", "Formal", 
    "Inspirational", "Debate-style", "Interview-style", "Storytelling", "Satirical", 
    "Educational", "Philosophical", "Speculative", "Motivational", "Fun", "Technical", 
    "Light-hearted", "Serious", "Investigative", "Debunking", "Didactic", 
    "Thought-provoking", "Controversial", "Sarcastic", "Emotional", "Exploratory", 
    "Fast-paced", "Slow-paced", "Introspective"
  ];

  const engagementTechniqueSuggestions = [
    "Rhetorical Questions", "Anecdotes", "Analogies", "Humor", "Metaphors", 
    "Storytelling", "Quizzes", "Personal Testimonials", "Quotes", "Jokes", 
    "Emotional Appeals", "Provocative Statements", "Sarcasm", "Pop Culture References", 
    "Thought Experiments", "Puzzles and Riddles", "Role-playing", "Debates", 
    "Catchphrases", "Statistics and Facts", "Open-ended Questions", 
    "Challenges to Assumptions", "Evoking Curiosity"
  ];

  const dialogueStructureSuggestions = [
    "Topic Introduction", "Opening Monologue", "Guest Introduction", "Icebreakers", 
    "Historical Context", "Defining Terms", "Problem Statement", "Overview of the Issue", 
    "Deep Dive into Subtopics", "Pro Arguments", "Con Arguments", "Cross-examination", 
    "Expert Interviews", "Case Studies", "Myth Busting", "Q&A Session", 
    "Rapid-fire Questions", "Summary of Key Points", "Recap", "Key Takeaways", 
    "Actionable Tips", "Call to Action", "Future Outlook", "Closing Remarks", 
    "Resource Recommendations", "Trending Topics", "Closing Inspirational Quote", 
    "Final Reflections"
  ];

  const handleAddRole = (role: string, type: 'person1' | 'person2') => {
    if (type === 'person1' && !person1Roles.includes(role)) {
      setPerson1Roles([...person1Roles, role]);
    } else if (type === 'person2' && !person2Roles.includes(role)) {
      setPerson2Roles([...person2Roles, role]);
    }
  };

  const handleRemoveRole = (role: string, type: 'person1' | 'person2') => {
    if (type === 'person1') {
      setPerson1Roles(person1Roles.filter(r => r !== role));
    } else if (type === 'person2') {
      setPerson2Roles(person2Roles.filter(r => r !== role));
    }
  };

  const handleAddStyle = (style: string, type: 'conversation' | 'engagement' | 'dialogue') => {
    if (type === 'conversation' && !conversationStyle.includes(style)) {
      setConversationStyle([...conversationStyle, style]);
    } else if (type === 'engagement' && !engagementTechniques.includes(style)) {
      setEngagementTechniques([...engagementTechniques, style]);
    } else if (type === 'dialogue' && !dialogueStructure.includes(style)) {
      setDialogueStructure([...dialogueStructure, style]);
    }
  };

  const handleRemoveStyle = (style: string, type: 'conversation' | 'engagement' | 'dialogue') => {
    if (type === 'conversation') {
      setConversationStyle(conversationStyle.filter(s => s !== style));
    } else if (type === 'engagement') {
      setEngagementTechniques(engagementTechniques.filter(s => s !== style));
    } else if (type === 'dialogue') {
      setDialogueStructure(dialogueStructure.filter(s => s !== style));
    }
  };

  // Fetch existing templates
  const fetchExistingTemplates = async () => {
    setLoadingTemplates(true);
    try {
      console.log("Loading existing podcast templates...");
      const templates = await podcastsAPI.getTemplates();
      console.log("✅ Existing templates loaded:", templates);
      setExistingTemplates(templates);
    } catch (error) {
      console.error("❌ Error loading existing templates:", error);
      toast({
        title: "Error",
        description: "Failed to load existing templates",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleCreateNewTemplate = () => {
    setShowNewTemplateForm(true);
    setExpandedTemplate(null); // Close any other expanded template
  };

  const toggleTemplateExpansion = (templateName: string) => {
    setExpandedTemplate(expandedTemplate === templateName ? null : templateName);
    setShowNewTemplateForm(false); // Close create form if open
  };

  const handleEditTemplate = (templateName: string) => {
    setEditingTemplate(templateName);
    setExpandedTemplate(templateName);
  };

  const handleSaveTemplateEdit = async (templateName: string, updatedData: any) => {
    try {
      setSavingTemplateEdit(templateName);
      
      await podcastsAPI.updateTemplate(templateName, updatedData);
      
      toast({
        title: "Success",
        description: "Template updated successfully!",
      });

      // Refresh the templates list
      await fetchExistingTemplates();
      setEditingTemplate(null);

    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingTemplateEdit(null);
    }
  };

  const openDeleteModal = (templateName: string) => {
    setTemplateToDelete(templateName);
    setShowDeleteModal(true);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      setDeletingTemplate(templateToDelete);
      
      await podcastsAPI.deleteTemplate(templateToDelete);
      
      toast({
        title: "Success",
        description: "Template deleted successfully!",
      });

      // Refresh the templates list
      await fetchExistingTemplates();
      setExpandedTemplate(null);

    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingTemplate(null);
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    }
  };

  // Fetch transformations from API
  useEffect(() => {
    const fetchTransformations = async () => {
      try {
        setLoadingTransformations(true);
        setErrorTransformations(null);
        const data = await transformationsAPI.list('name', 'asc');
        console.log("Fetched transformations:", data);
        console.log("Transformation apply_default values:", data.map(t => ({ name: t.name, apply_default: t.apply_default })));
        setTransformations(data);
      } catch (error) {
        console.error("Error fetching transformations:", error);
        setErrorTransformations(error instanceof Error ? error.message : 'Failed to fetch transformations');
      } finally {
        setLoadingTransformations(false);
      }
    };

    fetchTransformations();
    fetchExistingTemplates();
  }, []);

  // Fetch default models from Models page configuration
  useEffect(() => {
    const fetchDefaultModels = async () => {
      try {
        const defaultsData = await modelsAPI.getDefaults();
        if (defaultsData.default_text_to_speech_model) {
          // Parse the model ID to get provider and model name
          const modelId = defaultsData.default_text_to_speech_model;
          // Model ID format: "model:xxxxx" - we need to get the actual model data
          const models = await modelsAPI.list();
          const ttsModel = models.find(m => m.id === modelId);
          if (ttsModel) {
            setAudioModelProvider(ttsModel.provider);
            setAudioModel(ttsModel.name);
          }
        }
        // Fallback to hardcoded defaults if no default TTS model is set
        if (!audioModelProvider) {
          setAudioModelProvider("openai");
          setAudioModel("tts-1");
        }
      } catch (error) {
        console.error("Error fetching default models:", error);
        // Fallback to hardcoded defaults on error
        setAudioModelProvider("openai");
        setAudioModel("tts-1");
      }
    };

    fetchDefaultModels();
  }, []);

  const handleSave = async () => {
    try {
      setSavingTemplate(true);
      
      // Validate required fields
      if (!templateName.trim()) {
        toast({
          title: "Error",
          description: "Template name is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!podcastName.trim()) {
        toast({
          title: "Error", 
          description: "Podcast name is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!voice1.trim() || !voice2.trim()) {
        toast({
          title: "Error",
          description: "Both Voice 1 and Voice 2 are required",
          variant: "destructive",
        });
        return;
      }

      const templateData = {
        name: templateName.trim(),
        podcast_name: podcastName.trim(),
        podcast_tagline: podcastTagline.trim(),
        output_language: language || "English",
        person1_role: person1Roles,
        person2_role: person2Roles,
        conversation_style: conversationStyle,
        engagement_technique: engagementTechniques,
        dialogue_structure: dialogueStructure,
        transcript_model: "gpt-4o-mini", // Default as requested
        transcript_model_provider: "openai", // Default as requested
        user_instructions: userInstructions, // Optional field
        ending_message: endingMessage || "Thank you for listening!",
        creativity: creativity[0],
        provider: "openai", // Default as requested
        voice1: voice1.trim(),
        voice2: voice2.trim(),
        model: "tts-1", // Default as requested
      };

      console.log("Creating podcast template:", templateData);
      const response = await podcastsAPI.createTemplate(templateData);
      
      toast({
        title: "Success",
        description: "Podcast template created successfully!",
      });

      // Refresh the templates list
      await fetchExistingTemplates();

      // Close the form
      setShowNewTemplateForm(false);

      // Reset form
      setTemplateName("");
      setPodcastName("");
      setPodcastTagline("");
      setLanguage("");
      setPerson1Roles([]);
      setPerson2Roles([]);
      setConversationStyle([]);
      setEngagementTechniques([]);
      setDialogueStructure([]);
      setCreativity([0.0]);
      setEndingMessage("Thank you for listening!");
      setVoice1("");
      setVoice2("");
      setUserInstructions("");

    } catch (error) {
      console.error("Error creating podcast template:", error);
      toast({
        title: "Error",
        description: "Failed to create podcast template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingTemplate(false);
    }
  };


  const handleCreateNewTransformation = () => {
    setShowNewTransformationForm(true);
    setExpandedTransformation(null); // Close any other expanded transformation
  };

  const handleSaveNewTransformation = async () => {
    try {
      setLoadingTransformations(true);
      
      // Create transformation via API
      const newTransformation = await transformationsAPI.create({
      name: newTransformationName,
        title: newTransformationCardTitle,
      description: newTransformationDescription,
        prompt: newTransformationPrompt,
        apply_default: false
      });
    
      console.log("Successfully created transformation:", newTransformation);
    
      // Refresh the transformations list
      const updatedTransformations = await transformationsAPI.list('name', 'asc');
      setTransformations(updatedTransformations);
    
      // Close form and reset
      setShowNewTransformationForm(false);
      setNewTransformationName("New Transformation");
    setNewTransformationCardTitle("New Transformation Title");
    setNewTransformationDescription("New Transformation Description");
    setNewTransformationPrompt("New Transformation Prompt");
      
    } catch (error) {
      console.error("Error creating transformation:", error);
      setErrorTransformations(error instanceof Error ? error.message : 'Failed to create transformation');
    } finally {
      setLoadingTransformations(false);
    }
  };


  const handleSuggestByAI = () => {
    // AI suggestion logic here
    console.log("Getting AI suggestions...");
  };

  const handleToggleExpansion = (transformationId: string) => {
    setExpandedTransformation(expandedTransformation === transformationId ? null : transformationId);
    // Set the current transformation values when expanding
    if (expandedTransformation !== transformationId) {
      const transformation = transformations.find(t => t.id === transformationId);
      if (transformation) {
        setTransformationName(transformation.name);
        setCardTitle(transformation.title);
      }
    }
  };

  const handleEditTransformation = (transformation: Transformation) => {
    setEditingTransformation(transformation.id);
    setEditFormData({
      name: transformation.name,
      title: transformation.title,
      description: transformation.description,
      prompt: transformation.prompt
    });
  };

  const handleSaveTransformation = async (transformationId: string) => {
    try {
      setSavingTransformation(transformationId);
      
      await transformationsAPI.update(transformationId, {
        name: editFormData.name,
        title: editFormData.title,
        description: editFormData.description,
        prompt: editFormData.prompt
      });
      
      // Refresh transformations list
      const updatedTransformations = await transformationsAPI.list('name', 'asc');
      setTransformations(updatedTransformations);
      
      setEditingTransformation(null);
      setEditFormData({ name: '', title: '', description: '', prompt: '' });
      
      console.log("Transformation updated successfully");
    } catch (error) {
      console.error("Error updating transformation:", error);
      setErrorTransformations(error instanceof Error ? error.message : 'Failed to update transformation');
    } finally {
      setSavingTransformation(null);
    }
  };

  const handleDeleteTransformation = async (transformationId: string) => {
    try {
      setDeletingTransformation(transformationId);
      
      await transformationsAPI.delete(transformationId);
      
      // Refresh transformations list
      const updatedTransformations = await transformationsAPI.list('name', 'asc');
      setTransformations(updatedTransformations);
      
      // If the deleted transformation was expanded or being edited, close it
      if (expandedTransformation === transformationId) {
        setExpandedTransformation(null);
      }
      if (editingTransformation === transformationId) {
        setEditingTransformation(null);
      }
      
      console.log("Transformation deleted successfully");
    } catch (error) {
      console.error("Error deleting transformation:", error);
      setErrorTransformations(error instanceof Error ? error.message : 'Failed to delete transformation');
    } finally {
      setDeletingTransformation(null);
    }
  };

  const handleToggleDefaultTransformation = async (transformation: Transformation) => {
    try {
      console.log("🔄 handleToggleDefaultTransformation called for:", transformation.name, "apply_default:", transformation.apply_default);
      setSettingDefaultTransformation(transformation.id);
      
      if (transformation.apply_default) {
        // Unset as default
        console.log("🔄 Unsetting default transformation");
        const result = await (transformationsAPI as any).unsetDefault();
        console.log("🔄 Unset result:", result);
        toast({
          title: "Default transformation unset",
          description: `${transformation.name} is no longer the default transformation.`,
        });
      } else {
        // Set as default
        console.log("🔄 Setting default transformation");
        const result = await (transformationsAPI as any).setDefault(transformation.id);
        console.log("🔄 Set result:", result);
        toast({
          title: "Default transformation set",
          description: `${transformation.name} is now the default transformation and will be applied to new sources.`,
        });
      }
      
      // Refresh transformations list to update the apply_default status
      console.log("🔄 Refreshing transformations list...");
      const updatedTransformations = await transformationsAPI.list('name', 'asc');
      console.log("🔄 Updated transformations:", updatedTransformations.map(t => ({ name: t.name, apply_default: t.apply_default })));
      
      // Validate that only one transformation is set as default
      const defaultCount = updatedTransformations.filter(t => t.apply_default).length;
      console.log("🔄 Default transformations count:", defaultCount);
      if (defaultCount > 1) {
        console.warn("⚠️ Multiple transformations set as default! This should not happen.");
      }
      
      // Force a complete state refresh with multiple updates to ensure React detects the change
      setTransformations([]);
      setTransformationsUpdateCounter(prev => prev + 1);
      
      // Immediate update
      setTransformations(updatedTransformations);
      
      // Additional update after a short delay to ensure the state is properly set
      setTimeout(() => {
        setTransformations([...updatedTransformations]);
        setTransformationsUpdateCounter(prev => prev + 1);
        console.log("🔄 State updated with new transformations, counter:", transformationsUpdateCounter + 2);
        
        // Final check
        setTimeout(() => {
          console.log("🔄 Final state check:", transformations.map(t => ({ name: t.name, apply_default: t.apply_default })));
        }, 50);
      }, 50);
      
    } catch (error) {
      console.error("❌ Error setting default transformation:", error);
      console.error("❌ Error details:", error.message || error);
      toast({
        title: "Error",
        description: `Failed to set default transformation: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setSettingDefaultTransformation(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransformation(null);
    setEditFormData({ name: '', title: '', description: '', prompt: '' });
  };

  // EditTemplateForm component
  const EditTemplateForm = ({ template, onSave, onCancel, saving }: {
    template: PodcastTemplate;
    onSave: (data: any) => void;
    onCancel: () => void;
    saving: boolean;
  }) => {
    const [editData, setEditData] = useState({
      name: template.name,
      podcast_name: template.podcast_name,
      podcast_tagline: template.podcast_tagline,
      output_language: template.output_language,
      person1_role: template.person1_role || [],
      person2_role: template.person2_role || [],
      conversation_style: template.conversation_style || [],
      engagement_technique: template.engagement_technique || [],
      dialogue_structure: template.dialogue_structure || [],
      user_instructions: template.user_instructions || '',
      ending_message: template.ending_message || '',
      creativity: template.creativity,
      voice1: template.voice1,
      voice2: template.voice2,
      provider: template.provider,
      model: template.model,
      transcript_model: template.transcript_model || '',
      transcript_model_provider: template.transcript_model_provider || '',
    });

    const handleSave = () => {
      onSave(editData);
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-template-name">Template Name</Label>
            <Input
              id="edit-template-name"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-podcast-name">Podcast Name</Label>
            <Input
              id="edit-podcast-name"
              value={editData.podcast_name}
              onChange={(e) => setEditData({...editData, podcast_name: e.target.value})}
              placeholder="Enter podcast name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-podcast-tagline">Podcast Tagline</Label>
            <Input
              id="edit-podcast-tagline"
              value={editData.podcast_tagline}
              onChange={(e) => setEditData({...editData, podcast_tagline: e.target.value})}
              placeholder="Enter podcast tagline"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-language">Language</Label>
            <Input
              id="edit-language"
              value={editData.output_language}
              onChange={(e) => setEditData({...editData, output_language: e.target.value})}
              placeholder="Enter language"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-voice1">Voice 1</Label>
            <Input
              id="edit-voice1"
              value={editData.voice1}
              onChange={(e) => setEditData({...editData, voice1: e.target.value})}
              placeholder="Enter voice name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-voice2">Voice 2</Label>
            <Input
              id="edit-voice2"
              value={editData.voice2}
              onChange={(e) => setEditData({...editData, voice2: e.target.value})}
              placeholder="Enter voice name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-creativity">Creativity</Label>
          <Slider
            value={[editData.creativity]}
            onValueChange={(value) => setEditData({...editData, creativity: value[0]})}
            max={1}
            min={0}
            step={0.01}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">Creativity level: {editData.creativity}</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-user-instructions">User Instructions</Label>
          <Textarea
            id="edit-user-instructions"
            value={editData.user_instructions}
            onChange={(e) => setEditData({...editData, user_instructions: e.target.value})}
            placeholder="Enter user instructions"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-ending-message">Ending Message</Label>
          <Textarea
            id="edit-ending-message"
            value={editData.ending_message}
            onChange={(e) => setEditData({...editData, ending_message: e.target.value})}
            placeholder="Enter ending message"
            rows={2}
          />
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-provider">Provider</Label>
            <Input
              id="edit-provider"
              value={editData.provider}
              onChange={(e) => setEditData({...editData, provider: e.target.value})}
              placeholder="Enter provider"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-model">Model</Label>
            <Input
              id="edit-model"
              value={editData.model}
              onChange={(e) => setEditData({...editData, model: e.target.value})}
              placeholder="Enter model"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-transcript-model">Transcript Model</Label>
            <Input
              id="edit-transcript-model"
              value={editData.transcript_model}
              onChange={(e) => setEditData({...editData, transcript_model: e.target.value})}
              placeholder="Enter transcript model"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-transcript-provider">Transcript Provider</Label>
            <Input
              id="edit-transcript-provider"
              value={editData.transcript_model_provider}
              onChange={(e) => setEditData({...editData, transcript_model_provider: e.target.value})}
              placeholder="Enter transcript provider"
            />
          </div>
        </div>

        {/* Array Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-person1-roles">Person 1 Roles (comma-separated)</Label>
            <Textarea
              id="edit-person1-roles"
              value={editData.person1_role.join(', ')}
              onChange={(e) => setEditData({...editData, person1_role: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
              placeholder="Enter roles separated by commas"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-person2-roles">Person 2 Roles (comma-separated)</Label>
            <Textarea
              id="edit-person2-roles"
              value={editData.person2_role.join(', ')}
              onChange={(e) => setEditData({...editData, person2_role: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
              placeholder="Enter roles separated by commas"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-conversation-style">Conversation Style (comma-separated)</Label>
            <Textarea
              id="edit-conversation-style"
              value={editData.conversation_style.join(', ')}
              onChange={(e) => setEditData({...editData, conversation_style: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
              placeholder="Enter styles separated by commas"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-engagement-technique">Engagement Techniques (comma-separated)</Label>
            <Textarea
              id="edit-engagement-technique"
              value={editData.engagement_technique.join(', ')}
              onChange={(e) => setEditData({...editData, engagement_technique: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
              placeholder="Enter techniques separated by commas"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dialogue-structure">Dialogue Structure (comma-separated)</Label>
            <Textarea
              id="edit-dialogue-structure"
              value={editData.dialogue_structure.join(', ')}
              onChange={(e) => setEditData({...editData, dialogue_structure: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
              placeholder="Enter structure elements separated by commas"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-in-top">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full transition-all duration-200 hover:scale-110 hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/20 hover:shadow-md">
                <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl animate-slide-in-bottom">
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="models" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Models</span>
              <span className="xs:hidden">Models</span>
            </TabsTrigger>
            <TabsTrigger value="transformations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Leaf className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Transformations</span>
              <span className="xs:hidden">Transform</span>
            </TabsTrigger>
            <TabsTrigger value="podcast-templates" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Podcast Templates</span>
              <span className="xs:hidden">Podcast</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="mt-4 sm:mt-6">
            <ModelsTab />
          </TabsContent>

          <TabsContent value="transformations" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <h2 className="text-xl sm:text-2xl font-bold">Transformations</h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Transformations are prompts that can be used by the AI to create an automated output (e.g., a summary, key insights, etc.).
              </p>


              {/* Your Transformations */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold">Your Transformations</h3>
                  <Button onClick={handleCreateNewTransformation} className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span className="hidden xs:inline">Create new transformation</span>
                    <span className="xs:hidden">Create new</span>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {/* New Transformation Form */}
                  {showNewTransformationForm && (
                    <div className="bg-white border border-border rounded-xl">
                      {/* New Transformation Header */}
                      <div 
                        className={`flex items-center justify-between p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${
                          loadingTransformations 
                            ? 'cursor-not-allowed opacity-50' 
                            : 'hover:bg-muted/50 cursor-pointer'
                        }`}
                        onClick={() => !loadingTransformations && setShowNewTransformationForm(false)}
                      >
                        <span className="font-medium">New Tranformation</span>
                        <div className="text-muted-foreground">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* New Transformation Content */}
                      <div className="p-3 sm:p-4 border-t border-border">
                        <div className="space-y-3 sm:space-y-4">
                          {/* Transformation Name */}
                          <div className="space-y-2">
                            <Label className="text-sm">Transformation Name</Label>
                            <Input 
                              value={newTransformationName}
                              onChange={(e) => setNewTransformationName(e.target.value)}
                              placeholder="Enter transformation name"
                              className="text-sm"
                              disabled={loadingTransformations}
                            />
                          </div>

                          {/* Card Title */}
                          <div className="space-y-2">
                            <Label className="text-sm">Card Title (this will be the title of all cards created by this transformation). ie 'Key Topics'</Label>
                            <Input 
                              value={newTransformationCardTitle}
                              onChange={(e) => setNewTransformationCardTitle(e.target.value)}
                              placeholder="Enter card title"
                              className="text-sm"
                              disabled={loadingTransformations}
                            />
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <Label className="text-sm">Description (displayed as a hint in the UI so you know what you are selecting)</Label>
                            <Textarea
                              value={newTransformationDescription}
                              onChange={(e) => setNewTransformationDescription(e.target.value)}
                              rows={3}
                              placeholder="Enter description"
                              className="text-sm"
                              disabled={loadingTransformations}
                            />
                          </div>

                          {/* Prompt */}
                          <div className="space-y-2">
                            <Label className="text-sm">Prompt</Label>
                            <Textarea
                              value={newTransformationPrompt}
                              onChange={(e) => setNewTransformationPrompt(e.target.value)}
                              rows={8}
                              className="font-mono text-xs sm:text-sm"
                              placeholder="Enter your prompt here..."
                              disabled={loadingTransformations}
                            />
                          </div>

                          {/* Save Button */}
                          <div className="flex justify-end">
                            <Button 
                              onClick={handleSaveNewTransformation} 
                              size="sm" 
                              className="w-full sm:w-auto"
                              disabled={loadingTransformations}
                            >
                              {loadingTransformations ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Created Transformations */}
                  {userTransformations.map((transformation) => (
                    <div key={transformation.id} className="bg-white border border-border rounded-lg">
                      {/* Transformation Header */}
                      <div
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                        onClick={() => handleToggleExpansion(transformation.id)}
                      >
                        <span className="font-medium">
                          {transformation.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTransformation(transformation.id);
                            }}
                            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                          <div className="text-muted-foreground">
                            <svg 
                              className={`h-4 w-4 transition-transform ${expandedTransformation === transformation.id ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedTransformation === transformation.id && (
                        <div className="p-4 border-t border-border">
                          <div className="space-y-4">
                            {/* Transformation Name */}
                            <div className="space-y-2">
                              <Label>Transformation Name</Label>
                              <Input 
                                value={transformationName}
                                onChange={(e) => setTransformationName(e.target.value)}
                                placeholder="Enter transformation name"
                              />
                            </div>

                            {/* Card Title */}
                            <div className="space-y-2">
                              <Label>Card Title (this will be the title of all cards created by this transformation). ie 'Key Topics'</Label>
                              <Input 
                                value={cardTitle}
                                onChange={(e) => setCardTitle(e.target.value)}
                                placeholder="Enter card title"
                              />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <Label>Description (displayed as a hint in the UI so you know what you are selecting)</Label>
                              <Input 
                                value={transformation.description}
                                onChange={(e) => setTransformationDescription(e.target.value)}
                                placeholder="Enter description"
                              />
                            </div>

                            {/* Prompt */}
                            <div className="space-y-2">
                              <Label>Prompt</Label>
                              <Textarea
                                value={transformation.prompt}
                                onChange={(e) => setTransformationPrompt(e.target.value)}
                                rows={20}
                                className="font-mono text-sm"
                                placeholder="Enter your prompt here..."
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading State */}
                  {loadingTransformations && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading transformations...</span>
                    </div>
                  )}

                  {/* Error State */}
                  {errorTransformations && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">
                        Error loading transformations: {errorTransformations}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setErrorTransformations(null);
                          setLoadingTransformations(true);
                          // Re-fetch transformations
                          transformationsAPI.list('name', 'asc')
                            .then(data => {
                              setTransformations(data);
                              setLoadingTransformations(false);
                            })
                            .catch(error => {
                              setErrorTransformations(error instanceof Error ? error.message : 'Failed to fetch transformations');
                              setLoadingTransformations(false);
                            });
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  {/* Default Transformations */}
                  {!loadingTransformations && !errorTransformations && transformations.map((transformation, index) => (
                    <div key={`${transformation.id}-${transformationsUpdateCounter}-${index}`} className="bg-white border border-border rounded-lg">
                      {/* Transformation Header */}
                      <div
                        className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
                        onClick={() => handleToggleExpansion(transformation.id)}
                      >
                        <span className="font-medium">
                          {transformation.name}
                          {transformation.apply_default && " - default"}
                        </span>
                        <div className="text-muted-foreground">
                          <svg 
                            className={`h-4 w-4 transition-transform ${expandedTransformation === transformation.id ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedTransformation === transformation.id && (
                        <div className="p-4 border-t border-border">
                          <div className="space-y-4">
                            {/* Transformation Name */}
                            <div className="space-y-2">
                              <Label>Transformation Name</Label>
                              <Input 
                                value={editingTransformation === transformation.id ? editFormData.name : transformation.name}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                readOnly={editingTransformation !== transformation.id}
                                className={editingTransformation === transformation.id ? "" : "bg-muted"}
                              />
                            </div>

                            {/* Card Title */}
                            <div className="space-y-2">
                              <Label>Card Title (this will be the title of all cards created by this transformation). ie 'Key Topics'</Label>
                              <Input 
                                value={editingTransformation === transformation.id ? editFormData.title : transformation.title}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                                readOnly={editingTransformation !== transformation.id}
                                className={editingTransformation === transformation.id ? "" : "bg-muted"}
                              />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <Label>Description (displayed as a hint in the UI so you know what you are selecting)</Label>
                              <Input 
                                value={editingTransformation === transformation.id ? editFormData.description : transformation.description}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                                readOnly={editingTransformation !== transformation.id}
                                className={editingTransformation === transformation.id ? "" : "bg-muted"}
                              />
                            </div>

                            {/* Prompt */}
                            <div className="space-y-2">
                              <Label>Prompt</Label>
                              <Textarea
                                value={editingTransformation === transformation.id ? editFormData.prompt : transformation.prompt}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, prompt: e.target.value }))}
                                readOnly={editingTransformation !== transformation.id}
                                rows={20}
                                className={`font-mono text-sm ${editingTransformation === transformation.id ? "" : "bg-muted"}`}
                                placeholder="Enter your prompt here..."
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t">
                              {editingTransformation === transformation.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveTransformation(transformation.id)}
                                    disabled={savingTransformation === transformation.id}
                                  >
                                    {savingTransformation === transformation.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={savingTransformation === transformation.id}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTransformation(transformation);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={transformation.apply_default ? "default" : "outline"}
                                    onClick={(e) => {
                                      console.log("🔄 Set Default button clicked for:", transformation.name, "apply_default:", transformation.apply_default);
                                      e.stopPropagation();
                                      handleToggleDefaultTransformation(transformation);
                                    }}
                                    disabled={settingDefaultTransformation === transformation.id}
                                  >
                                    {settingDefaultTransformation === transformation.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {transformation.apply_default ? "Unsetting..." : "Setting..."}
                                      </>
                                    ) : (
                                      <>
                                        {transformation.apply_default ? (
                                          <>
                                            <Star className="h-4 w-4 mr-2 fill-current" />
                                            Default
                                          </>
                                        ) : (
                                          <>
                                            <Star className="h-4 w-4 mr-2" />
                                            Set Default
                                          </>
                                        )}
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTransformation(transformation.id);
                                    }}
                                    disabled={deletingTransformation === transformation.id}
                                  >
                                    {deletingTransformation === transformation.id ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="podcast-templates" className="mt-4 sm:mt-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-2">
                <Mic className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Podcast Templates</h2>
              </div>
              
              <p className="text-muted-foreground">
                Podcast templates define the structure, style, and voices for generating podcast episodes from your notebook content.
              </p>

               {/* Templates List Header */}
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-semibold">Your Podcast Templates</h3>
                 <Button 
                   onClick={handleCreateNewTemplate}
                   className="gap-2"
                 >
                   <Plus className="h-4 w-4" />
                   Create new template
                 </Button>
               </div>

               {/* Create New Template Form */}
               {showNewTemplateForm && (
                <Card className="border-primary/20 bg-primary/5">
               <CardHeader className="p-4 sm:p-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Plus className="h-4 w-4" />
                     <CardTitle className="text-lg sm:text-xl">Create New Template</CardTitle>
                   </div>
                   <Button 
                     variant="ghost" 
                     size="sm"
                     onClick={() => setShowNewTemplateForm(false)}
                     className="h-8 w-8 p-0"
                   >
                     <X className="h-4 w-4" />
                   </Button>
                 </div>
                 <CardDescription className="text-sm">Fill out the details below to create a new podcast template</CardDescription>
               </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Template Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name" className="text-sm">Template Name</Label>
                      <Input
                        id="template-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Enter template name"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="podcast-name" className="text-sm">Podcast Name</Label>
                      <Input
                        id="podcast-name"
                        value={podcastName}
                        onChange={(e) => setPodcastName(e.target.value)}
                        placeholder="Enter podcast name"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="podcast-tagline" className="text-sm">Podcast Tagline</Label>
                    <Input
                      id="podcast-tagline"
                      value={podcastTagline}
                      onChange={(e) => setPodcastTagline(e.target.value)}
                      placeholder="Enter podcast tagline"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-instructions" className="text-sm">User Instructions</Label>
                    <Textarea
                      id="user-instructions"
                      value={userInstructions}
                      onChange={(e) => setUserInstructions(e.target.value)}
                      placeholder="Any additional instructions to pass to the LLM that will generate the transcript"
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* Roles Section */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Person 1 roles</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {person1Roles.map((role) => (
                          <Badge key={role} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveRole(role, 'person1')}>
                            {role} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !person1Roles.includes(value)) {
                                handleAddRole(value, 'person1');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {roleSuggestions.slice(0, 10).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddRole(suggestion, 'person1')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Person 2 roles</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {person2Roles.map((role) => (
                          <Badge key={role} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveRole(role, 'person2')}>
                            {role} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !person2Roles.includes(value)) {
                                handleAddRole(value, 'person2');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {roleSuggestions.slice(10, 20).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddRole(suggestion, 'person2')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Conversation and Engagement */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Conversation Style</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {conversationStyle.map((style) => (
                          <Badge key={style} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveStyle(style, 'conversation')}>
                            {style} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !conversationStyle.includes(value)) {
                                handleAddStyle(value, 'conversation');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {conversationStyleSuggestions.slice(0, 10).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddStyle(suggestion, 'conversation')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Engagement Techniques</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {engagementTechniques.map((technique) => (
                          <Badge key={technique} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveStyle(technique, 'engagement')}>
                            {technique} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !engagementTechniques.includes(value)) {
                                handleAddStyle(value, 'engagement');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {engagementTechniqueSuggestions.slice(0, 10).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddStyle(suggestion, 'engagement')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Dialogue Structure</Label>
                      <div className="min-h-[40px] border border-input rounded-xl px-3 py-2 bg-background flex flex-wrap gap-2 items-center">
                        {dialogueStructure.map((structure) => (
                          <Badge key={structure} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveStyle(structure, 'dialogue')}>
                            {structure} ×
                          </Badge>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Press enter to add more" 
                          className="flex-1 min-w-[120px] outline-none bg-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !dialogueStructure.includes(value)) {
                                handleAddStyle(value, 'dialogue');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions:</div>
                      <div className="flex flex-wrap gap-1">
                        {dialogueStructureSuggestions.slice(0, 10).map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="outline"
                            className="cursor-pointer text-xs"
                            onClick={() => handleAddStyle(suggestion, 'dialogue')}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Settings */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Creativity</Label>
                      <div className="px-3">
                        <Slider
                          value={creativity}
                          onValueChange={setCreativity}
                          max={1}
                          min={0}
                          step={0.01}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0.00</span>
                          <span>{creativity[0].toFixed(2)}</span>
                          <span>1.00</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ending-message">Ending Message</Label>
                      <Textarea
                        id="ending-message"
                        value={endingMessage}
                        onChange={(e) => setEndingMessage(e.target.value)}
                        placeholder="Thank you for listening!"
                        rows={3}
                      />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="voice1">Voice 1</Label>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="voice1"
                          value={voice1}
                          onChange={(e) => setVoice1(e.target.value)}
                          placeholder="Enter voice name"
                        />
                        <div className="text-xs text-muted-foreground">
                          Voice names are case sensitive. Be sure to add the exact name.
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sample voices from: <a href="https://platform.openai.com/docs/guides/text-to-speech" target="_blank" rel="noopener noreferrer" className="text-primary cursor-pointer hover:underline">OpenAI</a>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="voice2">Voice 2</Label>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <Input
                          id="voice2"
                          value={voice2}
                          onChange={(e) => setVoice2(e.target.value)}
                          placeholder="Enter voice name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Save Button */}
                <div className="flex justify-end">
                      <Button 
                        onClick={handleSave} 
                        className="gap-2"
                        disabled={savingTemplate}
                      >
                        {savingTemplate ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                    <Save className="h-4 w-4" />
                        )}
                        {savingTemplate ? "Saving..." : "Save"}
                  </Button>
                </div>
               </CardContent>
             </Card>
               )}

               {/* Templates List */}
               <div className="space-y-3">
                 {loadingTemplates ? (
                   <div className="flex items-center justify-center py-8">
                     <Loader2 className="h-6 w-6 animate-spin" />
                     <span className="ml-2">Loading templates...</span>
                   </div>
                 ) : existingTemplates.length === 0 ? (
                   <div className="text-center py-8 text-muted-foreground">
                     <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                     <p>No templates created yet</p>
                     <p className="text-sm">Create your first template above</p>
                   </div>
                 ) : (
                   existingTemplates.map((template) => (
                     <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
                       <CardContent 
                         className="p-4"
                         onClick={() => toggleTemplateExpansion(template.name)}
                       >
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <Mic className="h-5 w-5 text-primary" />
                             <div>
                               <p className="font-medium">{template.name}</p>
                               <p className="text-sm text-muted-foreground">
                                 {template.podcast_name} • {template.output_language}
                               </p>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-muted-foreground">
                               {(template.person1_role?.length || 0) + (template.person2_role?.length || 0)} roles
                             </span>
                             <div className={`transform transition-transform ${
                               expandedTemplate === template.name ? 'rotate-180' : ''
                             }`}>
                               <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                               </svg>
                             </div>
                           </div>
                         </div>
                         
                         {/* Expanded Content */}
                         {expandedTemplate === template.name && (
                           <div className="mt-4 pt-4 border-t space-y-4">
                             {editingTemplate === template.name ? (
                               /* Edit Form */
                               <div onClick={(e) => e.stopPropagation()}>
                                 <EditTemplateForm 
                                   template={template}
                                   onSave={(updatedData) => handleSaveTemplateEdit(template.name, updatedData)}
                                   onCancel={() => setEditingTemplate(null)}
                                   saving={savingTemplateEdit === template.name}
                                 />
                               </div>
                             ) : (
                               /* View Mode */
                               <>
                                 {/* Template Details */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                   <div>
                                     <span className="font-medium">Podcast Name:</span> {template.podcast_name}
                                   </div>
                                   <div>
                                     <span className="font-medium">Tagline:</span> {template.podcast_tagline}
                                   </div>
                                   <div>
                                     <span className="font-medium">Language:</span> {template.output_language}
                                   </div>
                                   <div>
                                     <span className="font-medium">Creativity:</span> {template.creativity}
                                   </div>
                                   <div>
                                     <span className="font-medium">Provider:</span> {template.provider}
                                   </div>
                                   <div>
                                     <span className="font-medium">Model:</span> {template.model}
                                   </div>
                                   <div>
                                     <span className="font-medium">Transcript Model:</span> {template.transcript_model || 'Not set'}
                                   </div>
                                   <div>
                                     <span className="font-medium">Transcript Provider:</span> {template.transcript_model_provider || 'Not set'}
                                   </div>
                                 </div>
                                 
                                 {/* Roles */}
                                 <div className="space-y-2">
                                   <div className="text-sm">
                                     <span className="font-medium">Person 1 Roles:</span>
                                     <div className="flex flex-wrap gap-1 mt-1">
                                       {template.person1_role && template.person1_role.length > 0 ? (
                                         template.person1_role.map((role, index) => (
                                           <Badge key={index} variant="secondary" className="text-xs">
                                             {role}
                                           </Badge>
                                         ))
                                       ) : (
                                         <span className="text-xs text-muted-foreground italic">No roles defined</span>
                                       )}
                                     </div>
                                   </div>
                                   <div className="text-sm">
                                     <span className="font-medium">Person 2 Roles:</span>
                                     <div className="flex flex-wrap gap-1 mt-1">
                                       {template.person2_role && template.person2_role.length > 0 ? (
                                         template.person2_role.map((role, index) => (
                                           <Badge key={index} variant="secondary" className="text-xs">
                                             {role}
                                           </Badge>
                                         ))
                                       ) : (
                                         <span className="text-xs text-muted-foreground italic">No roles defined</span>
                                       )}
                                     </div>
                                   </div>
                                 </div>

                                 {/* Conversation Style */}
                                 <div className="space-y-2">
                                   <div className="text-sm">
                                     <span className="font-medium">Conversation Style:</span>
                                     <div className="flex flex-wrap gap-1 mt-1">
                                       {template.conversation_style && template.conversation_style.length > 0 ? (
                                         template.conversation_style.map((style, index) => (
                                           <Badge key={index} variant="outline" className="text-xs">
                                             {style}
                                           </Badge>
                                         ))
                                       ) : (
                                         <span className="text-xs text-muted-foreground italic">No styles defined</span>
                                       )}
                                     </div>
                                   </div>
                                   <div className="text-sm">
                                     <span className="font-medium">Engagement Techniques:</span>
                                     <div className="flex flex-wrap gap-1 mt-1">
                                       {template.engagement_technique && template.engagement_technique.length > 0 ? (
                                         template.engagement_technique.map((technique, index) => (
                                           <Badge key={index} variant="outline" className="text-xs">
                                             {technique}
                                           </Badge>
                                         ))
                                       ) : (
                                         <span className="text-xs text-muted-foreground italic">No techniques defined</span>
                                       )}
                                     </div>
                                   </div>
                                   <div className="text-sm">
                                     <span className="font-medium">Dialogue Structure:</span>
                                     <div className="flex flex-wrap gap-1 mt-1">
                                       {template.dialogue_structure && template.dialogue_structure.length > 0 ? (
                                         template.dialogue_structure.map((structure, index) => (
                                           <Badge key={index} variant="outline" className="text-xs">
                                             {structure}
                                           </Badge>
                                         ))
                                       ) : (
                                         <span className="text-xs text-muted-foreground italic">No structure defined</span>
                                       )}
                                     </div>
                                   </div>
                                 </div>

                                 {/* Voices and Additional Info */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                   <div>
                                     <span className="font-medium">Voice 1:</span> {template.voice1}
                                   </div>
                                   <div>
                                     <span className="font-medium">Voice 2:</span> {template.voice2}
                                   </div>
                               <div className="md:col-span-2">
                                 <span className="font-medium">User Instructions:</span>
                                 <p className="text-muted-foreground mt-1">{template.user_instructions || 'No instructions provided'}</p>
                               </div>
                               <div className="md:col-span-2">
                                 <span className="font-medium">Ending Message:</span>
                                 <p className="text-muted-foreground mt-1">{template.ending_message || 'No ending message set'}</p>
                               </div>
                                 </div>

                                 {/* Action Buttons */}
                                 <div className="flex justify-end gap-2 pt-4 border-t">
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleEditTemplate(template.name);
                                     }}
                                     disabled={editingTemplate === template.name || savingTemplateEdit === template.name}
                                   >
                                     <Edit className="h-4 w-4 mr-2" />
                                     Edit
                                   </Button>
                                   <Button
                                     variant="destructive"
                                     size="sm"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       openDeleteModal(template.name);
                                     }}
                                     disabled={deletingTemplate === template.name}
                                   >
                                     {deletingTemplate === template.name ? (
                                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                     ) : (
                                       <Trash2 className="h-4 w-4 mr-2" />
                                     )}
                                     {deletingTemplate === template.name ? 'Deleting...' : 'Delete'}
                                   </Button>
                                 </div>
                               </>
                             )}
                           </div>
                         )}
                       </CardContent>
                     </Card>
                   ))
                 )}
               </div>
                 </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* Delete Template Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the template "{templateToDelete}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setTemplateToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
              disabled={deletingTemplate !== null}
            >
              {deletingTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
