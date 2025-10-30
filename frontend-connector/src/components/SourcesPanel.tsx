import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Youtube, 
  Globe, 
  Trash2, 
  Plus,
  Search,
  Upload,
  Link,
  Download,
  ExternalLink,
  ChevronLeft,
  Play,
  Sparkles,
  FileIcon,
  Type,
  Edit,
  MoreVertical,
  RefreshCw,
  Lightbulb,
  BookOpen,
  X,
  Loader2
} from "lucide-react";
import { sourcesAPI, notesAPI, serperAPI, transformationsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Source, Transformation } from "@/types";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface SourcesPanelProps {
  notebookId: string;
  notebookName: string;
}

export function SourcesPanel({ notebookId, notebookName }: SourcesPanelProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingSource, setAddingSource] = useState(false);
  
  // Debug addingSource state changes
  useEffect(() => {
    console.log("🔄 addingSource state changed:", addingSource);
  }, [addingSource]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDiscoverForm, setShowDiscoverForm] = useState(false);
  
  // Debug state changes
  useEffect(() => {
    console.log("showAddForm changed:", showAddForm);
  }, [showAddForm]);
  
  useEffect(() => {
    console.log("showDiscoverForm changed:", showDiscoverForm);
  }, [showDiscoverForm]);
  const [sourceType, setSourceType] = useState<"link" | "upload" | "text">("link");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [transformation, setTransformation] = useState<string>("");
  const [transformationError, setTransformationError] = useState<string>("");
  const [sourceInsights, setSourceInsights] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const [sourceToRename, setSourceToRename] = useState<Source | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loadingTransformations, setLoadingTransformations] = useState(false);
  const { toast } = useToast();

  // Debug modal state
  useEffect(() => {
    console.log("🔧 Modal state changed:", { showRenameModal, sourceToRename: sourceToRename?.title });
  }, [showRenameModal, sourceToRename]);

  const loadSources = useCallback(async () => {
    try {
      console.log("🔍 SourcesPanel: loadSources called with notebookName:", notebookName);
      setLoading(true);
      const data = await sourcesAPI.listByNotebookName(notebookName);
      console.log("📊 SourcesPanel: Received data:", data);
      console.log("📊 SourcesPanel: Data type:", typeof data, "Array?", Array.isArray(data));
      
      // Debug each source to see if insights are included
      if (Array.isArray(data)) {
        data.forEach((source, index) => {
          console.log(`📊 SourcesPanel: Source ${index} (${source.title}):`, source);
          console.log(`📊 SourcesPanel: Source ${index} insights:`, source.insights);
        });
      }
      
      setSources(data);
      console.log("✅ SourcesPanel: Sources state updated with", data?.length || 0, "sources");
      return data; // Return the sources for immediate use
    } catch (error) {
      console.error("❌ SourcesPanel: Error loading sources:", error);
      toast({
        title: "Error loading sources",
        description: "Failed to load sources. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadTransformations = useCallback(async () => {
    try {
      console.log("🔄 SourcesPanel: Loading transformations...");
      setLoadingTransformations(true);
      const data = await transformationsAPI.list('name', 'asc');
      console.log("📊 SourcesPanel: Received transformations:", data);
      setTransformations(data || []);
    } catch (error) {
      console.error("❌ SourcesPanel: Error loading transformations:", error);
      toast({
        title: "Error",
        description: "Failed to load transformations",
        variant: "destructive",
      });
    } finally {
      setLoadingTransformations(false);
    }
  }, [toast]);

  const loadSourceInsights = useCallback(async (source: Source) => {
    try {
      console.log("🔍 SourcesPanel: Loading insights for source:", source.title);
      console.log("🔍 SourcesPanel: Source object:", source);
      console.log("🔍 SourcesPanel: Source.insights:", source.insights);
      
      // Use the insights that are already available in the source object
      if (source.insights && Array.isArray(source.insights)) {
        console.log("🔍 SourcesPanel: Insights array:", source.insights);
        source.insights.forEach((insight, index) => {
          console.log(`🔍 SourcesPanel: Insight ${index}:`, insight);
        });
        setSourceInsights(source.insights);
        console.log("✅ SourcesPanel: Loaded", source.insights.length, "insights from source object");
      } else {
        // If no insights in the source object, try to fetch them directly from the API
        console.log("ℹ️ SourcesPanel: No insights in source object, fetching from API...");
        try {
          const sourceDetails = await sourcesAPI.getByTitle(source.title);
          if (sourceDetails && sourceDetails.insights && Array.isArray(sourceDetails.insights)) {
            setSourceInsights(sourceDetails.insights);
            console.log("✅ SourcesPanel: Loaded", sourceDetails.insights.length, "insights from API");
          } else {
            setSourceInsights([]);
            console.log("ℹ️ SourcesPanel: No insights found in API response");
          }
        } catch (apiError) {
          console.error("❌ SourcesPanel: Error fetching insights from API:", apiError);
          setSourceInsights([]);
        }
      }
    } catch (error) {
      console.error("❌ SourcesPanel: Error loading insights:", error);
      setSourceInsights([]);
    }
  };

  useEffect(() => {
    loadSources();
    loadTransformations();
  }, [notebookId, notebookName, loadSources, loadTransformations]);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'txt':
      case 'doc':
        return <FileText className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await sourcesAPI.delete(id);
      toast({
        title: "Source deleted",
        description: "The source has been removed from your notebook.",
      });
      if (selectedSource?.id === id) {
        setSelectedSource(null);
      }
      loadSources();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete source. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log("🚀 Starting file upload, setting addingSource to true");
    setAddingSource(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('type', 'upload');
      const result = await sourcesAPI.createByNotebookName(notebookName, formData);
      toast({
        title: "File uploaded",
        description: result.title ? `"${result.title}" has been added to the notebook.` : "Your file has been added to the notebook.",
      });
      loadSources();
      setShowAddForm(false);
    } catch (error) {
      console.error("❌ File upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("✅ File upload completed, setting addingSource to false");
      setAddingSource(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    console.log("🚀 Starting URL submit, setting addingSource to true");
    setAddingSource(true);
    try {
      const formData = new FormData();
      formData.append('url', urlInput);
      formData.append('type', 'link');
      const result = await sourcesAPI.createByNotebookName(notebookName, formData);
      toast({
        title: "URL added",
        description: result.title ? `"${result.title}" has been added to your notebook.` : "The URL has been added to your notebook.",
      });
      setUrlInput("");
      loadSources();
      setShowAddForm(false);
    } catch (error) {
      console.error("❌ URL submit failed:", error);
      toast({
        title: "Failed to add URL",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      console.log("✅ URL submit completed, setting addingSource to false");
      setAddingSource(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    console.log("🚀 Starting text submit, setting addingSource to true");
    setAddingSource(true);
    try {
      const formData = new FormData();
      formData.append('content', textInput);
      formData.append('type', 'text');
      const result = await sourcesAPI.createByNotebookName(notebookName, formData);
      toast({
        title: "Text added",
        description: result.title ? `"${result.title}" has been added to the notebook.` : "Your text has been added to the notebook.",
      });
      setTextInput("");
      loadSources();
      setShowAddForm(false);
    } catch (error) {
      console.error("❌ Text submit failed:", error);
      toast({
        title: "Failed to add text",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log("✅ Text submit completed, setting addingSource to false");
      setAddingSource(false);
    }
  };

  const handleDiscoverSubmit = async () => {
    if (!discoverQuery.trim()) return;

    setAddingSource(true);
    try {
      toast({
        title: "Discovering sources",
        description: `Finding sources related to: ${discoverQuery}`,
      });
      
      // Call Serper API to search for relevant sources
      const searchResponse = await serperAPI.search(discoverQuery, {
        num_results: 10,
        country: "us",
        language: "en"
      });
      
      console.log("🔍 Search results:", searchResponse);
      setSearchResults(searchResponse.results || []);
      setShowSearchResults(true);
      setShowDiscoverForm(false);
      
      toast({
        title: "Sources discovered",
        description: `Found ${searchResponse.results?.length || 0} relevant sources`,
      });
    } catch (error) {
      console.error("❌ Discovery failed:", error);
      toast({
        title: "Discovery failed",
        description: "Failed to search for sources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingSource(false);
    }
  };

  const handleAddSearchResult = async (result: any) => {
    setAddingSource(true);
    try {
      const formData = new FormData();
      formData.append('url', result.link);
      formData.append('type', 'link');
      formData.append('title', result.title);
      
      await sourcesAPI.createByNotebookName(notebookName, formData);
      
      toast({
        title: "Source added",
        description: `Added "${result.title}" to your notebook`,
      });
      
      // Remove the added result from search results
      setSearchResults(prev => prev.filter(r => r.link !== result.link));
      loadSources();
    } catch (error) {
      console.error("❌ Failed to add source:", error);
      toast({
        title: "Error",
        description: "Failed to add source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingSource(false);
    }
  };

  const handleTransformation = async () => {
    if (!transformation || !selectedSource) return;

    setLoading(true);
    try {
      console.log("🔍 SourcesPanel: Running transformation:", transformation, "on source:", selectedSource.title);
      
      // Call the real transformation API
      const result = await sourcesAPI.runTransformationsByTitle(selectedSource.title, transformation);
      
      console.log("✅ SourcesPanel: Transformation result:", result);
      
      // Clear any previous transformation errors since insights will be displayed individually
      setTransformationError("");
      
      toast({
        title: "Transformation completed",
        description: `Applied ${transformation} transformation successfully.`,
      });
      
      // Immediately update the selected source with the new insight from the transformation result
      if (result && result.results && result.results.length > 0) {
        const transformationResult = result.results[0];
        if (transformationResult.success && transformationResult.output) {
          // Create a new insight object from the transformation result
          const newInsight = {
            id: `temp_${Date.now()}`, // Temporary ID
            insight_type: transformation,
            content: transformationResult.output,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          };
          
          // Add the new insight to the current source's insights
          const updatedSource = {
            ...selectedSource,
            insights: [...(selectedSource.insights || []), newInsight]
          };
          
          // Update the selected source state immediately
          setSelectedSource(updatedSource);
          
          // Update the insights display immediately
          setSourceInsights(updatedSource.insights || []);
          
          console.log("✅ SourcesPanel: Updated source with new insight immediately");
        }
      }
      
      // Also reload sources to get the latest data from the backend
      const updatedSources = await loadSources();
      
      // Update the selected source with the latest data from backend
      if (selectedSource && updatedSources) {
        const backendUpdatedSource = updatedSources.find(s => s.title === selectedSource.title);
        if (backendUpdatedSource) {
          setSelectedSource(backendUpdatedSource);
          setSourceInsights(backendUpdatedSource.insights || []);
          console.log("✅ SourcesPanel: Updated source with backend data");
        }
      }
      
    } catch (error) {
      console.error("❌ SourcesPanel: Transformation error:", error);
      setTransformationError(`Failed to apply "${transformation}" transformation: ${error.message}`);
      
      toast({
        title: "Transformation failed",
        description: "Failed to apply transformation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleRenameSource = async () => {
    if (!sourceToRename || !renameTitle.trim()) return;
    
    try {
      // Use the source ID for update if title is empty, otherwise use title
      if (sourceToRename.title && sourceToRename.title.trim()) {
        await sourcesAPI.updateByTitle(sourceToRename.title, { title: renameTitle.trim() });
      } else {
        await sourcesAPI.update(sourceToRename.id, { title: renameTitle.trim() });
      }
      toast({
        title: "Source renamed",
        description: `Source renamed to "${renameTitle.trim()}".`,
      });
      setShowRenameModal(false);
      setRenameTitle("");
      setSourceToRename(null);
      await loadSources(); // Reload to get updated data
    } catch (error) {
      console.error("❌ SourcesPanel: Error renaming source:", error);
      toast({
        title: "Rename failed",
        description: "Failed to rename source. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openRenameModal = (source: Source) => {
    console.log("🔧 Opening rename modal for source:", source.title);
    setSourceToRename(source);
    setRenameTitle(source.title);
    setShowRenameModal(true);
    console.log("🔧 Modal state set to true");
  };

  const handleDeleteSource = async () => {
    if (!selectedSource) return;
    
    try {
      console.log("🗑️ SourcesPanel: Deleting source:", selectedSource.title, "ID:", selectedSource.id);
      
      // Use the source ID for delete if title is empty, otherwise use title
      let deleteResult;
      if (selectedSource.title && selectedSource.title.trim()) {
        console.log("🗑️ Using deleteByTitle for:", selectedSource.title);
        deleteResult = await sourcesAPI.deleteByTitle(selectedSource.title);
      } else {
        console.log("🗑️ Using delete by ID for:", selectedSource.id);
        deleteResult = await sourcesAPI.delete(selectedSource.id);
      }
      
      console.log("✅ SourcesPanel: Delete result:", deleteResult);
      
      toast({
        title: "Source deleted",
        description: `Source "${selectedSource.title || 'Untitled'}" has been deleted successfully.`,
      });
      
      // Clear the selected source and related state
      setSelectedSource(null);
      setSourceInsights([]);
      setTransformationResult("");
      setTransformationError("");
      setShowDeleteConfirm(false);
      
      // Reload sources to get updated data
      await loadSources();
      
      console.log("✅ SourcesPanel: Source deletion completed successfully");
      
    } catch (error) {
      console.error("❌ SourcesPanel: Error deleting source:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to delete source. Please try again.";
      if (error.message) {
        if (error.message.includes("not found")) {
          errorMessage = "Source not found. It may have already been deleted.";
        } else if (error.message.includes("Internal server error")) {
          errorMessage = "Server error occurred. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Delete failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };


  const handleSourceSelect = (source: Source) => {
    setSelectedSource(source);
    setTransformationError(""); // Clear previous errors
    setSourceInsights([]); // Clear previous insights
    
    // Load insights for this source
    loadSourceInsights(source);
  };

  const handleSaveInsightAsNote = async (insight: any) => {
    if (!selectedSource || !notebookId) return;
    
    try {
      const noteTitle = `${insight.insight_type || insight.title || 'Insight'} from ${selectedSource.title}`;
      await notesAPI.create({
        title: noteTitle,
        content: insight.content,
        notebook_id: notebookId,
      });
      
      toast({
        title: "Note created",
        description: `Insight saved as note: "${noteTitle}"`,
      });
    } catch (error) {
      console.error("❌ SourcesPanel: Error saving insight as note:", error);
      toast({
        title: "Failed to save note",
        description: "Failed to save insight as note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredSources = sources.filter(source =>
    source.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Debug logging
  console.log("🔍 SourcesPanel: sources state:", sources);
  console.log("🔍 SourcesPanel: sources length:", sources.length);
  console.log("🔍 SourcesPanel: filteredSources:", filteredSources);
  console.log("🔍 SourcesPanel: filteredSources length:", filteredSources.length);
  console.log("🔍 SourcesPanel: searchQuery:", searchQuery);
  console.log("🔍 SourcesPanel: Will render sources?", filteredSources.length > 0);
  console.log("🔍 SourcesPanel: Will show empty state?", filteredSources.length === 0);

  // Loading overlay component
  const LoadingOverlay = () => {
    console.log("🎯 LoadingOverlay rendered, addingSource:", addingSource);
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card border rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="font-semibold text-lg">Adding Source</h3>
            <p className="text-muted-foreground text-sm">Please wait while we process your source...</p>
          </div>
        </div>
      </div>
    );
  };

  // Show source detail view when a source is selected
  if (selectedSource) {
    return (
      <>
        {addingSource && <LoadingOverlay />}
        <div className="h-full flex flex-col bg-background">
        {/* Source Header */}
        <div className="sticky top-0 z-10 p-3 sm:p-4 border-b bg-background/95 backdrop-blur">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSource(null)}
                className="shrink-0 h-8 w-8 sm:h-9 sm:w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                {getSourceIcon(selectedSource.type)}
              </div>
                <div className="flex-1 min-w-0">
                 <div className="flex items-center justify-between">
                   <h2 className="text-sm sm:text-base lg:text-lg font-semibold truncate">{selectedSource.title}</h2>
                   <div className="flex items-center gap-1 ml-2">
                     <Button 
                       size="sm" 
                       variant="ghost" 
                       onClick={() => {
                         console.log("🔧 Edit button clicked for source:", selectedSource.title);
                         openRenameModal(selectedSource);
                       }} 
                       className="h-6 w-6 p-0"
                       title="Rename source"
                     >
                       <Edit className="h-3 w-3" />
                     </Button>
                     <Button 
                       size="sm" 
                       variant="ghost" 
                       onClick={() => setShowDeleteConfirm(true)} 
                       className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                       title="Delete source"
                     >
                       <Trash2 className="h-3 w-3" />
                     </Button>
                   </div>
                 </div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs">{selectedSource.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedSource.created || selectedSource.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {/* Transformation Controls */}
            <div className="flex items-center gap-2">
              <Select value={transformation} onValueChange={setTransformation} disabled={loadingTransformations}>
                <SelectTrigger className="flex-1 sm:w-[140px] lg:w-[180px] h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder={loadingTransformations ? "Loading..." : "Apply transformation"} />
                </SelectTrigger>
                <SelectContent>
                  {transformations.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="default"
                size="sm"
                onClick={handleTransformation}
                disabled={!transformation || loading}
                className="h-8 sm:h-9 px-3 text-xs sm:text-sm"
              >
                <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Run
              </Button>
            </div>
          </div>
        </div>
        
        {/* Source Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            {/* Insights Section */}
            {sourceInsights.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    Transformation Insights ({sourceInsights.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedSource && loadSourceInsights(selectedSource)}
                    className="h-8 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
                
                <Accordion type="multiple" className="space-y-2">
                  {sourceInsights.map((insight, index) => (
                    <AccordionItem key={insight.id || index} value={`insight-${index}`} className="border rounded-lg">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2 text-left">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="font-medium">{insight.insight_type || insight.title || `Insight ${index + 1}`}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-3">
                          <div className="prose prose-sm max-w-none">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {insight.content}
                            </p>
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                // Copy to clipboard
                                navigator.clipboard.writeText(insight.content);
                                toast({
                                  title: "Copied to clipboard",
                                  description: "Insight content copied to clipboard.",
                                });
                              }}
                            >
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleSaveInsightAsNote(insight)}
                            >
                              Save as Note
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Transformation Error Display */}
            {transformationError && (
              <div className="mb-6">
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2 text-destructive">
                    <X className="h-4 w-4" />
                    Transformation Error
                  </h3>
                  <p className="text-sm sm:text-base text-destructive whitespace-pre-wrap">
                    {transformationError}
                  </p>
                </div>
              </div>
            )}

            {/* Source Content Preview */}
            <div className="bg-card rounded-lg p-4 sm:p-6 min-h-[200px]">
              <h3 className="font-semibold text-base sm:text-lg mb-3">Source Content</h3>
              {selectedSource?.full_text ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-muted-foreground">
                    {selectedSource.full_text.length > 500 
                      ? `${selectedSource.full_text.substring(0, 500)}...` 
                      : selectedSource.full_text
                    }
                  </p>
                </div>
              ) : (
                <p className="text-sm sm:text-base text-muted-foreground">
                  Content preview would appear here. This would show the actual content
                  from the PDF, website, or YouTube transcript.
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
        
        {/* Source Actions */}
        <div className="p-3 sm:p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Download
            </Button>
            <Button variant="outline" className="flex-1 h-8 sm:h-9 text-xs sm:text-sm">
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Open Original
            </Button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Show add source form
  if (showAddForm) {
    return (
      <>
        {addingSource && <LoadingOverlay />}
        <div className="h-full flex flex-col bg-background">
        {/* Add Source Header */}
        <div className="p-4 sm:p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Add a Source</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!addingSource) {
                  setShowAddForm(false);
                  setUrlInput("");
                  setTextInput("");
                }
              }}
              disabled={addingSource}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add Source Form */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Source Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base">Type</Label>
                <RadioGroup 
                  value={sourceType} 
                  onValueChange={(v) => !addingSource && setSourceType(v as "link" | "upload" | "text")}
                  disabled={addingSource}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="link" id="link" disabled={addingSource} />
                    <Label htmlFor="link" className="font-normal cursor-pointer">Link</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" disabled={addingSource} />
                    <Label htmlFor="upload" className="font-normal cursor-pointer">Upload</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="text" disabled={addingSource} />
                    <Label htmlFor="text" className="font-normal cursor-pointer">Text</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Content Input Based on Type */}
              {sourceType === "link" && (
                <div className="space-y-3">
                  <Label htmlFor="url-input" className="text-sm sm:text-base">Link</Label>
                  <Input
                    id="url-input"
                    placeholder="Enter URL (website or YouTube)..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !addingSource && handleUrlSubmit()}
                    className="text-sm sm:text-base"
                    disabled={addingSource}
                  />
                  <Button 
                    onClick={handleUrlSubmit}
                    className="w-full"
                    disabled={addingSource || !urlInput.trim()}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Add URL
                  </Button>
                </div>
              )}

              {sourceType === "upload" && (
                <div className="space-y-3">
                  <Label className="text-sm sm:text-base">File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center">
                    <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Drop files here or click to browse
                    </p>
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.txt,.doc,.docx"
                      className="hidden"
                      id="file-upload"
                      disabled={addingSource}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={addingSource}
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="text-xs sm:text-sm"
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>
              )}

              {sourceType === "text" && (
                <div className="space-y-3">
                  <Label htmlFor="text-input" className="text-sm sm:text-base">Text Content</Label>
                  <Textarea
                    id="text-input"
                    placeholder="Enter or paste your text here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[200px] text-sm sm:text-base"
                    disabled={addingSource}
                  />
                  <Button 
                    onClick={handleTextSubmit}
                    className="w-full"
                    disabled={addingSource || !textInput.trim()}
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Add Text
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
      </>
    );
  }

  // Show discover form
  if (showDiscoverForm) {
    return (
      <>
        {addingSource && <LoadingOverlay />}
        <div className="h-full flex flex-col bg-background">
        {/* Discover Header */}
        <div className="p-4 sm:p-6 border-b bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Discover sources</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!addingSource) {
                  setShowDiscoverForm(false);
                  setDiscoverQuery("");
                }
              }}
              disabled={addingSource}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Discover Form */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6">
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
              <div className="text-center py-6 sm:py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">What are you interested in?</h3>
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Describe something that you'd like to learn about or click 'I'm feeling curious' to explore a new topic."
                  value={discoverQuery}
                  onChange={(e) => setDiscoverQuery(e.target.value)}
                  className="min-h-[150px] text-sm sm:text-base resize-none"
                  disabled={addingSource}
                />
                
                {!discoverQuery && (
                  <p className="text-xs sm:text-sm text-destructive">Please fill out this field.</p>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={handleDiscoverSubmit}
                    className="flex-1"
                    disabled={addingSource || !discoverQuery.trim()}
                  >
                    Discover Sources
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setDiscoverQuery("I'm feeling curious")}
                    className="flex-1"
                    disabled={addingSource}
                  >
                    I'm feeling curious
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
      </>
    );
  }

  // Show search results view
  if (showSearchResults) {
    return (
      <>
        {addingSource && <LoadingOverlay />}
        <div className="h-full flex flex-col bg-background">
          {/* Search Results Header */}
          <div className="p-4 sm:p-6 border-b bg-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Search Results</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Found {searchResults.length} sources for "{discoverQuery}"
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowSearchResults(false);
                  setSearchResults([]);
                  setDiscoverQuery("");
                }}
                disabled={addingSource}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Results List */}
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6">
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try a different search query</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-medium text-sm sm:text-base line-clamp-2">
                              {result.title}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {result.snippet}
                          </p>
                          <a 
                            href={result.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {result.link}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddSearchResult(result)}
                          disabled={addingSource}
                          className="flex-shrink-0"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </>
    );
  }

  // Default sources list view
  return (
    <>
      {addingSource && <LoadingOverlay />}
      <div className="h-full flex flex-col bg-background animate-content-fade-in">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-muted/30 animate-slide-in-top">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-semibold animate-fade-in-scale">Sources</h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddForm(true)}
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md animate-bounce-in"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Add
            </Button>
            <Button 
              onClick={() => setShowDiscoverForm(true)}
              size="sm"
              variant="outline"
              className="h-8 sm:h-9 text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md animate-bounce-in"
            >
              Discover
            </Button>
            {sources.length > 0 && (
              <Button 
                onClick={() => openRenameModal(sources[0])}
                size="sm"
                variant="outline"
                className="h-8 sm:h-9 text-xs sm:text-sm"
              >
                Test Rename
              </Button>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8 sm:h-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Sources List */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          {filteredSources.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No sources yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {searchQuery ? "No sources match your search" : "Upload documents or add links to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-1">
              {filteredSources.map((source, index) => (
                  <Card 
                    key={source.id} 
                    className={cn(
                      "group hover:bg-accent/50 transition-all duration-300 cursor-pointer relative hover:scale-[1.02] hover:shadow-md",
                      "animate-stagger-in",
                      `animate-stagger-${Math.min(index + 1, 6)}`
                    )}
                    onClick={() => handleSourceSelect(source)}
                  >
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1 bg-primary/10 rounded shrink-0">
                          {getSourceIcon(source.type)}
                        </div>
                          <div className="flex-1 min-w-0">
                           <div className="flex items-start gap-1">
                             <h4 className="font-medium text-sm leading-tight break-words">{source.title}</h4>
                             {source.title && !source.title.includes('File:') && !source.title.includes('Link:') && source.title !== 'Untitled Source' && (
                               <Sparkles className="h-2.5 w-2.5 text-primary/60 mt-0.5 flex-shrink-0" title="AI-generated title" />
                             )}
                             {source.insights && source.insights.length > 0 && (
                               <Lightbulb className="h-2.5 w-2.5 text-yellow-500 mt-0.5 flex-shrink-0" title={`${source.insights.length} transformation(s) applied`} />
                             )}
                           </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-2.5 w-2.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                openRenameModal(source);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rename source
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSource(source);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove source
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
    
    {/* Delete Confirmation Dialog */}
    {showDeleteConfirm && selectedSource && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-background border border-border rounded-lg max-w-lg w-full mx-4">
          <div className="p-4 border-b">
            <h3 className="text-xl font-semibold">Delete Source</h3>
          </div>
          <div className="p-6">
            <p className="text-muted-foreground">
              Are you sure you want to delete "{selectedSource.title}"? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end p-4 border-t bg-muted/20">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                className="text-base"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteSource}
                className="text-base"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Rename Source Dialog */}
    {showRenameModal && sourceToRename && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-background border border-border rounded-lg max-w-lg w-full mx-4">
          <div className="p-4 border-b">
            <h3 className="text-xl font-semibold">Rename {sourceToRename.title}</h3>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium mb-2">Source name*</label>
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Enter new title..."
              className="mb-4 w-full bg-background border border-border text-base py-3 px-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameSource();
                }
                if (e.key === 'Escape') {
                  setShowRenameModal(false);
                  setRenameTitle("");
                  setSourceToRename(null);
                }
              }}
              autoFocus
            />
          </div>
          <div className="flex justify-end p-4 border-t bg-muted/20">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameTitle("");
                  setSourceToRename(null);
                }}
                className="text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRenameSource} 
                disabled={!renameTitle.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}