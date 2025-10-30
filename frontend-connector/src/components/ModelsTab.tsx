import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Brain,
  Volume2,
  Mic,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { modelsAPI } from "@/services/api";

// Types
interface Model {
  id: string;
  name: string;
  provider: string;
  type: "language" | "embedding" | "text_to_speech" | "speech_to_text";
  created: string;
  updated: string;
  provider_status: boolean;
}

interface DefaultModels {
  id: string;
  default_chat_model?: string;
  default_transformation_model?: string;
  default_embedding_model?: string;
  default_text_to_speech_model?: string;
  default_speech_to_text_model?: string;
  default_tools_model?: string;
  large_context_model?: string;
  created: string;
  updated: string;
}

interface ProviderStatus {
  available: string[];
  unavailable: string[];
}

export default function ModelsTab() {
  const { toast } = useToast();
  
  // State
  const [models, setModels] = useState<Model[]>([]);
  const [defaultModels, setDefaultModels] = useState<DefaultModels | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({ available: [], unavailable: [] });
  const [languageProviders, setLanguageProviders] = useState<string[]>([]);
  const [embeddingProviders, setEmbeddingProviders] = useState<string[]>([]);
  const [ttsProviders, setTtsProviders] = useState<string[]>([]);
  const [sttProviders, setSttProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);
  
  
  // Model testing state
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [clearingCache, setClearingCache] = useState(false);
  
  // Add model form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newModelProvider, setNewModelProvider] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [newModelType, setNewModelType] = useState<"language" | "embedding" | "text_to_speech" | "speech_to_text">("language");
  
  // Default model assignments
  const [defaultChatModel, setDefaultChatModel] = useState("");
  const [defaultTransformationModel, setDefaultTransformationModel] = useState("");
  const [defaultEmbeddingModel, setDefaultEmbeddingModel] = useState("");
  const [defaultTTSModel, setDefaultTTSModel] = useState("");
  const [defaultSTTModel, setDefaultSTTModel] = useState("");
  const [defaultToolsModel, setDefaultToolsModel] = useState("");
  const [defaultLargeContextModel, setDefaultLargeContextModel] = useState("");

  // Provider options are now fetched dynamically from the backend


  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      
          // Fetch models
          const modelsData = await modelsAPI.list();
          console.log("🔄 Fetched models:", modelsData);
          setModels(modelsData || []);
      
      // Fetch default models
      try {
        const defaultsData = await modelsAPI.getDefaults();
        console.log("🔄 Fetched defaults:", defaultsData);
        setDefaultChatModel(defaultsData.default_chat_model || "");
        setDefaultTransformationModel(defaultsData.default_transformation_model || "");
        setDefaultEmbeddingModel(defaultsData.default_embedding_model || "");
        setDefaultTTSModel(defaultsData.default_text_to_speech_model || "");
        setDefaultSTTModel(defaultsData.default_speech_to_text_model || "");
        setDefaultToolsModel(defaultsData.default_tools_model || "");
        setDefaultLargeContextModel(defaultsData.large_context_model || "");
      } catch (error) {
        console.warn("Could not fetch default models:", error);
      }
      
      // Fetch provider status
      const providersData = await modelsAPI.getProviders();
      setProviderStatus(providersData || { available: [], unavailable: [] });
      
      // Fetch provider lists for each model type using the modelsAPI
      try {
        const [languageData, embeddingData, ttsData, sttData] = await Promise.all([
          modelsAPI.getProvidersForType("language"),
          modelsAPI.getProvidersForType("embedding"),
          modelsAPI.getProvidersForType("text_to_speech"),
          modelsAPI.getProvidersForType("speech_to_text")
        ]);
        
        setLanguageProviders(languageData || []);
        setEmbeddingProviders(embeddingData || []);
        setTtsProviders(ttsData || []);
        setSttProviders(sttData || []);
        
        console.log("✅ Successfully fetched provider lists:", {
          language: languageData?.length || 0,
          embedding: embeddingData?.length || 0,
          tts: ttsData?.length || 0,
          stt: sttData?.length || 0
        });
      } catch (providerError) {
        console.warn("Error fetching provider lists:", providerError);
        // Fallback to hardcoded lists
        setLanguageProviders(["azure", "deepseek", "google", "groq", "mistral", "ollama", "openai", "openrouter", "vertex", "xai"]);
        setEmbeddingProviders(["azure", "google", "mistral", "ollama", "openai", "transformers", "vertex", "voyage"]);
        setTtsProviders(["elevenlabs", "google", "openai", "vertex"]);
        setSttProviders(["elevenlabs", "groq", "openai"]);
        
        // Show a warning toast for provider fetch errors
        toast({
          title: "Provider list warning",
          description: "Using fallback provider lists. Some providers may not be available.",
          variant: "destructive",
        });
      }
      
      // Fetch default models (if endpoint is working)
      try {
        const defaultsData = await modelsAPI.getDefaults();
        setDefaultModels(defaultsData);
        
        // Set form values
        setDefaultChatModel(defaultsData.default_chat_model || "");
        setDefaultTransformationModel(defaultsData.default_transformation_model || "");
        setDefaultEmbeddingModel(defaultsData.default_embedding_model || "");
        setDefaultTTSModel(defaultsData.default_text_to_speech_model || "");
        setDefaultSTTModel(defaultsData.default_speech_to_text_model || "");
        setDefaultToolsModel(defaultsData.default_tools_model || "");
        setDefaultLargeContextModel(defaultsData.large_context_model || "");
      } catch (defaultsError) {
        console.warn("Default models endpoint not working:", defaultsError);
        // Continue without default models
      }
      
    } catch (error) {
      console.error("Error fetching models data:", error);
      toast({
        title: "Error",
        description: "Failed to load models data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  // Delete model using the new endpoint
  const handleDeleteModel = async () => {
    if (!modelToDelete) {
      console.log("❌ No model to delete");
      return;
    }
    
    try {
      console.log("🔄 handleDeleteModel called for:", modelToDelete.id);
      console.log("🔄 Model details:", {
        provider: modelToDelete.provider,
        name: modelToDelete.name,
        type: modelToDelete.type
      });
      setDeleting(modelToDelete.id);
      
      // Use the new endpoint to delete by type, provider, and name
      await modelsAPI.deleteByTypeAndName(
        modelToDelete.type,
        modelToDelete.provider,
        modelToDelete.name
      );
      
      toast({
        title: "Success",
        description: "Model deleted successfully",
      });
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Error deleting model:", error);
      
      // Handle different error types
      let errorMessage = "Failed to delete model. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Cannot delete this model as it's currently set as a default model.";
        } else if (error.message.includes("404")) {
          errorMessage = "Model not found. It may have already been deleted.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error occurred while deleting the model.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Delete failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
      setShowDeleteModal(false);
      setModelToDelete(null);
    }
  };


  // Open delete confirmation
  const openDeleteModal = (model: Model) => {
    // Check if model is being used as a default
    const isDefaultModel = defaultModels && (
      defaultModels.default_chat_model === model.id ||
      defaultModels.default_transformation_model === model.id ||
      defaultModels.default_embedding_model === model.id ||
      defaultModels.default_text_to_speech_model === model.id ||
      defaultModels.default_speech_to_text_model === model.id ||
      defaultModels.default_tools_model === model.id ||
      defaultModels.large_context_model === model.id
    );

    if (isDefaultModel) {
      toast({
        title: "Cannot Delete Model",
        description: "This model is currently set as a default model. Please change the default model first.",
        variant: "destructive",
      });
      return;
    }

    setModelToDelete(model);
    setShowDeleteModal(true);
  };

  // Force remove model from list (for when backend deletion fails)
  const forceRemoveModel = (model: Model) => {
    console.log("🔄 Force removing model from list:", model.id);
    setModels(prevModels => prevModels.filter(m => m.id !== model.id));
    toast({
      title: "Model removed from list",
      description: "Model has been removed from the frontend list. It may still exist on the server.",
    });
  };

  // Check if model already exists
  const isModelDuplicate = (provider: string, name: string, type: string) => {
    const isDuplicate = models.some(model => 
      model.provider === provider && 
      model.name === name && 
      model.type === type
    );
    console.log("🔄 isModelDuplicate check:", {
      provider,
      name,
      type,
      isDuplicate,
      existingModels: models.map(m => `${m.provider}/${m.name} (${m.type})`)
    });
    return isDuplicate;
  };

  // Add model
  const handleAddModel = async (modelType?: "language" | "embedding" | "text_to_speech" | "speech_to_text") => {
    // Ensure modelType is a valid string, not an event object
    let typeToUse = newModelType; // Default to the state value
    
    if (modelType && typeof modelType === 'string' && 
        ['language', 'embedding', 'text_to_speech', 'speech_to_text'].includes(modelType)) {
      typeToUse = modelType;
    }
    
    console.log("🔄 handleAddModel called with:", {
      modelType,
      typeToUse,
      newModelProvider,
      newModelName,
      newModelType
    });
    
    if (!newModelProvider || !newModelName) {
      console.log("❌ Missing required fields");
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates before making API call
    if (isModelDuplicate(newModelProvider, newModelName, typeToUse)) {
      toast({
        title: "Model Already Exists",
        description: `A ${typeToUse} model with provider "${newModelProvider}" and name "${newModelName}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure we only send valid string values
      const modelData = {
        provider: String(newModelProvider).trim(),
        name: String(newModelName).trim(),
        type: String(typeToUse).trim(),
      };
      
      console.log("🔄 Model data to send:", modelData);
      console.log("🔄 Provider type:", typeof newModelProvider, "value:", newModelProvider);
      console.log("🔄 Name type:", typeof newModelName, "value:", newModelName);
      console.log("🔄 Type type:", typeof typeToUse, "value:", typeToUse);
      
      // Validate that all values are strings and not empty
      if (typeof modelData.provider !== 'string' || modelData.provider === '' ||
          typeof modelData.name !== 'string' || modelData.name === '' ||
          typeof modelData.type !== 'string' || modelData.type === '') {
        throw new Error("Invalid model data: all fields must be non-empty strings");
      }
      
      // Validate that type is one of the allowed values
      const validTypes = ['language', 'embedding', 'text_to_speech', 'speech_to_text'];
      if (!validTypes.includes(modelData.type)) {
        throw new Error(`Invalid model type: ${modelData.type}. Must be one of: ${validTypes.join(', ')}`);
      }
      
      await modelsAPI.create(modelData);

      toast({
        title: "Success",
        description: "Model added successfully",
      });

      // Reset form
      setNewModelProvider("");
      setNewModelName("");
      setNewModelType("language");

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Error adding model:", error);
      
      // Handle specific error cases
      let errorMessage = "Failed to add model";
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorMessage = `Model already exists: ${error.message}`;
        } else if (error.message.includes('Invalid model data')) {
          errorMessage = error.message;
        } else if (error.message.includes('Invalid model type')) {
          errorMessage = error.message;
        } else if (error.message.includes('422')) {
          errorMessage = "Invalid model configuration. Please check your provider and model name.";
        } else if (error.message.includes('400')) {
          errorMessage = "Bad request. Please check your input.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error occurred while adding the model.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Test model
  const handleTestModel = async (modelId: string) => {
    try {
      setTestingModel(modelId);
      
      const result = await modelsAPI.test(modelId, "Hello, this is a test message. Please respond with 'Model test successful.'");
      
      toast({
        title: "Model Test Successful",
        description: `Model responded: ${result.message || 'Test completed successfully'}`,
      });
    } catch (error) {
      console.error("Error testing model:", error);
      toast({
        title: "Model Test Failed",
        description: error instanceof Error ? error.message : "Failed to test model",
        variant: "destructive",
      });
    } finally {
      setTestingModel(null);
    }
  };


  // Clear model cache
  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      
      await modelsAPI.clearCache();

      toast({
        title: "Success",
        description: "Model cache cleared successfully",
      });
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear cache",
        variant: "destructive",
      });
    } finally {
      setClearingCache(false);
    }
  };

  // Save default models
  const handleSaveDefaults = async () => {
    try {
      console.log("🔄 handleSaveDefaults called");
      setSaving(true);
      
      const defaultsData = {
        default_chat_model: defaultChatModel || null,
        default_transformation_model: defaultTransformationModel || null,
        default_embedding_model: defaultEmbeddingModel || null,
        default_text_to_speech_model: defaultTTSModel || null,
        default_speech_to_text_model: defaultSTTModel || null,
        default_tools_model: defaultToolsModel || null,
        large_context_model: defaultLargeContextModel || null,
      };
      
      console.log("🔄 Saving defaults:", defaultsData);
      
      await modelsAPI.updateDefaults(defaultsData);

      toast({
        title: "Success",
        description: "Default models updated successfully",
      });
      
      // Refresh data to show updated defaults in dropdowns
      await fetchData();
    } catch (error) {
      console.error("Error saving defaults:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update default models",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Get models by type with validation
  const getModelsByType = (type: string) => {
    return models.filter(model => model.type === type && model.id && model.provider && model.name);
  };

  // Get model display name
  const getModelDisplayName = (model: Model) => {
    return `${model.provider}/${model.name}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Models</h2>
        </div>
      </div>




      {/* Language Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Language Models
          </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Left Column */}
             <div className="space-y-6">
               {/* Add New Model */}
               <div className="space-y-4">
                 <Label className="text-base font-medium">Add New Model</Label>
                 
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="new-model-provider">Provider</Label>
                     <Select value={newModelProvider} onValueChange={(value) => {
                       console.log("🔄 Provider changed to:", value, "type:", typeof value);
                       setNewModelProvider(value);
                     }}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select provider" />
                       </SelectTrigger>
                       <SelectContent>
                         {languageProviders.map((provider) => (
                           <SelectItem key={provider} value={provider}>
                             {provider}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="new-model-name" className="flex items-center gap-1">
                       Model Name
                       <span className="text-muted-foreground">?</span>
                      {newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, newModelType) && (
                        <span title="This model already exists">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </span>
                      )}
                     </Label>
                     <Input
                       id="new-model-name"
                       value={newModelName}
                       onChange={(e) => {
                         console.log("🔄 Model name changed to:", e.target.value, "type:", typeof e.target.value);
                         setNewModelName(e.target.value);
                       }}
                       placeholder="Enter model name"
                       className={newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, newModelType) ? "border-amber-500 focus:border-amber-500" : ""}
                     />
                     {newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, newModelType) && (
                       <p className="text-sm text-amber-600">
                         ⚠️ This model already exists in the system
                       </p>
                     )}
                   </div>

                  <Button 
                    onClick={() => handleAddModel()} 
                    className="w-full"
                    disabled={!newModelProvider || !newModelName || isModelDuplicate(newModelProvider, newModelName, newModelType)}
                  >
                    {isModelDuplicate(newModelProvider, newModelName, newModelType) ? "Model Already Exists" : "Add Model"}
                  </Button>
                 </div>
               </div>

               {/* Default Model Assignments */}
               <div className="space-y-4">
                 <Label className="text-base font-medium">Default Model Assignments</Label>
                 
                 {/* First row - Chat and Tools models */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="chat-model">Chat Model</Label>
                     <Select value={defaultChatModel} onValueChange={setDefaultChatModel}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select chat model" />
                       </SelectTrigger>
                       <SelectContent>
                         {getModelsByType("language").map((model) => (
                           <SelectItem key={model.id} value={model.id}>
                             {getModelDisplayName(model)}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground">Pick the one that vibes with you.</p>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="tools-model">Tools Model</Label>
                     <Select value={defaultToolsModel} onValueChange={setDefaultToolsModel}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select tools model" />
                       </SelectTrigger>
                       <SelectContent>
                         {getModelsByType("language").map((model) => (
                           <SelectItem key={model.id} value={model.id}>
                             {getModelDisplayName(model)}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground">Recommended: gpt-4o, claude, qwen3, etc.</p>
                   </div>
                 </div>

                 {/* Second row - Transformation and Large Context models */}
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="transformation-model">Transformation Model</Label>
                     <Select value={defaultTransformationModel} onValueChange={setDefaultTransformationModel}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select transformation model" />
                       </SelectTrigger>
                       <SelectContent>
                         {getModelsByType("language").map((model) => (
                           <SelectItem key={model.id} value={model.id}>
                             {getModelDisplayName(model)}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground">Can use cheaper models: gpt-4o-mini, llama3, gemma3, etc.</p>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="large-context-model">Large Context Model</Label>
                     <Select value={defaultLargeContextModel} onValueChange={setDefaultLargeContextModel}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select large context model" />
                       </SelectTrigger>
                       <SelectContent>
                         {getModelsByType("language").map((model) => (
                           <SelectItem key={model.id} value={model.id}>
                             {getModelDisplayName(model)}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <p className="text-xs text-muted-foreground">Recommended: Gemini models</p>
                   </div>
                 </div>

                 {/* Save button */}
                 <Button onClick={handleSaveDefaults} disabled={saving} className="w-full mt-4">
                   {saving ? (
                     <>
                       <Loader2 className="h-4 w-4 animate-spin mr-2" />
                       Saving...
                     </>
                   ) : (
                     "Save Defaults"
                   )}
                 </Button>
               </div>
             </div>

             {/* Right Column */}
             <div className="space-y-6">
               {/* Configured Models */}
               <div className="space-y-2">
                 <Label>Configured Models ({getModelsByType("language").length})</Label>
                 <div className="space-y-2">
                   {getModelsByType("language").length === 0 ? (
                     <p className="text-sm text-muted-foreground italic">No language models configured</p>
                   ) : (
                     getModelsByType("language").map((model) => (
                       <div key={model.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                         <div className="flex items-center gap-2">
                           <span className="text-sm font-medium">• {model.provider}/{model.name}</span>
                           {deleting === model.id && (
                             <span className="text-xs text-muted-foreground">Deleting...</span>
                           )}
                         </div>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => openDeleteModal(model)}
                           disabled={deleting === model.id}
                           className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
                         >
                           {deleting === model.id ? (
                             <Loader2 className="h-3 w-3 animate-spin" />
                           ) : (
                             <Trash2 className="h-3 w-3" />
                           )}
                         </Button>
                       </div>
                     ))
                   )}
                 </div>
               </div>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Embedding Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Embedding Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Add New Model */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Add New Model</Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-embedding-provider">Provider</Label>
                    <Select value={newModelProvider} onValueChange={setNewModelProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {embeddingProviders.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-embedding-name" className="flex items-center gap-1">
                      Model Name
                      <span className="text-muted-foreground">?</span>
                      {newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, "embedding") && (
                        <span title="This model already exists">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </span>
                      )}
                    </Label>
                    <Input
                      id="new-embedding-name"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      placeholder="Enter model name"
                      className={newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, "embedding") ? "border-amber-500 focus:border-amber-500" : ""}
                    />
                    {newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, "embedding") && (
                      <p className="text-sm text-amber-600">
                        ⚠️ This embedding model already exists in the system
                      </p>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleAddModel("embedding")} 
                    className="w-full"
                    disabled={!newModelProvider || !newModelName || isModelDuplicate(newModelProvider, newModelName, "embedding")}
                  >
                    {isModelDuplicate(newModelProvider, newModelName, "embedding") ? "Model Already Exists" : "Add Model"}
                  </Button>
                </div>
              </div>

              {/* Default Embedding Model */}
              <div className="space-y-2">
                <Label htmlFor="embedding-model">Default Embedding Model</Label>
                <Select value={defaultEmbeddingModel} onValueChange={setDefaultEmbeddingModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select embedding model" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsByType("embedding").map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {getModelDisplayName(model)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Used for generating embeddings from text content</p>
              </div>

              {/* Save Defaults Button for Embedding */}
              <Button 
                onClick={handleSaveDefaults} 
                className="w-full" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Defaults"
                )}
              </Button>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Configured Models */}
              <div className="space-y-2">
                <Label>Configured Models ({getModelsByType("embedding").length})</Label>
                <div className="space-y-2">
                  {getModelsByType("embedding").length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No embedding models configured</p>
                  ) : (
                    getModelsByType("embedding").map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">• {model.provider}/{model.name}</span>
                          {deleting === model.id && (
                            <span className="text-xs text-muted-foreground">Deleting...</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(model)}
                          disabled={deleting === model.id}
                          className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
                        >
                          {deleting === model.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text-to-Speech Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Text-to-Speech Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Add New Model */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Add New Model</Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tts-provider">Provider</Label>
                    <Select value={newModelProvider} onValueChange={setNewModelProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {ttsProviders.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tts-name" className="flex items-center gap-1">
                      Model Name
                      <span className="text-muted-foreground">?</span>
                      {newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, "text_to_speech") && (
                        <span title="This model already exists">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </span>
                      )}
                    </Label>
                    <Input
                      id="tts-name"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      placeholder="Enter model name"
                      className={newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, "text_to_speech") ? "border-amber-500 focus:border-amber-500" : ""}
                    />
                    {newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, "text_to_speech") && (
                      <p className="text-sm text-amber-600">
                        ⚠️ This TTS model already exists in the system
                      </p>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleAddModel("text_to_speech")} 
                    className="w-full"
                    disabled={!newModelProvider || !newModelName || isModelDuplicate(newModelProvider, newModelName, "text_to_speech")}
                  >
                    {isModelDuplicate(newModelProvider, newModelName, "text_to_speech") ? "Model Already Exists" : "Add Model"}
                  </Button>
                </div>
              </div>

              {/* Default TTS Model */}
              <div className="space-y-2">
                <Label htmlFor="tts-model" className="flex items-center gap-1">
                  Default TTS Model
                  <span className="text-muted-foreground">?</span>
                </Label>
                <Select value={defaultTTSModel} onValueChange={setDefaultTTSModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select TTS model" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsByType("text_to_speech").map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {getModelDisplayName(model)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Can be overridden per podcast</p>
              </div>

              {/* Save Defaults Button for TTS */}
              <Button 
                onClick={handleSaveDefaults} 
                className="w-full" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Defaults"
                )}
              </Button>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Configured Models */}
              <div className="space-y-2">
                <Label>Configured Models ({getModelsByType("text_to_speech").length})</Label>
                {getModelsByType("text_to_speech").length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      No text-to-speech models configured.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {getModelsByType("text_to_speech").map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">• {model.provider}/{model.name}</span>
                          {deleting === model.id && (
                            <span className="text-xs text-muted-foreground">Deleting...</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(model)}
                          disabled={deleting === model.id}
                          className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
                        >
                          {deleting === model.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speech-to-Text Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Speech-to-Text Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Add New Model */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Add New Model</Label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stt-provider">Provider</Label>
                    <Select value={newModelProvider} onValueChange={setNewModelProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {sttProviders.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stt-name" className="flex items-center gap-1">
                      Model Name
                      <span className="text-muted-foreground">?</span>
                      {newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, "speech_to_text") && (
                        <span title="This model already exists">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </span>
                      )}
                    </Label>
                    <Input
                      id="stt-name"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      placeholder="Enter model name"
                      className={newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, "speech_to_text") ? "border-amber-500 focus:border-amber-500" : ""}
                    />
                    {newModelProvider && newModelName && isModelDuplicate(newModelProvider, newModelName, "speech_to_text") && (
                      <p className="text-sm text-amber-600">
                        ⚠️ This STT model already exists in the system
                      </p>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleAddModel("speech_to_text")} 
                    className="w-full"
                    disabled={!newModelProvider || !newModelName || isModelDuplicate(newModelProvider, newModelName, "speech_to_text")}
                  >
                    {isModelDuplicate(newModelProvider, newModelName, "speech_to_text") ? "Model Already Exists" : "Add Model"}
                  </Button>
                </div>
              </div>

              {/* Default STT Model */}
              <div className="space-y-2">
                <Label htmlFor="stt-model" className="flex items-center gap-1">
                  Default STT Model
                  <span className="text-muted-foreground">?</span>
                </Label>
                <Select value={defaultSTTModel} onValueChange={setDefaultSTTModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select STT model" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsByType("speech_to_text").map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {getModelDisplayName(model)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Used for converting speech to text</p>
              </div>

              {/* Save Defaults Button for STT */}
              <Button 
                onClick={handleSaveDefaults} 
                className="w-full" 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Defaults"
                )}
              </Button>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Configured Models */}
              <div className="space-y-2">
                <Label>Configured Models ({getModelsByType("speech_to_text").length})</Label>
                <div className="space-y-2">
                  {getModelsByType("speech_to_text").length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No speech-to-text models configured</p>
                  ) : (
                    getModelsByType("speech_to_text").map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">• {model.provider}/{model.name}</span>
                          {deleting === model.id && (
                            <span className="text-xs text-muted-foreground">Deleting...</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(model)}
                          disabled={deleting === model.id}
                          className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
                        >
                          {deleting === model.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>




      {/* Delete Model Confirmation Dialog */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{modelToDelete?.provider}/{modelToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModel}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting === modelToDelete?.id}
            >
              {deleting === modelToDelete?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
