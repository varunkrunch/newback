import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Download, Trash2, Minimize2, AudioLines, Video, Network, FileBarChart, Plus, FileText, ChevronLeft, Menu, X, Upload, Link, Type, Sparkles, Play, Pause, Edit, MoreVertical, MoreHorizontal, Globe, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notebookAPI } from "@/services/api";
import type { Notebook } from "@/types";
import { ChatPanel } from "@/components/ChatPanel";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { sourcesAPI, notesAPI, podcastsAPI, serperAPI, transformationsAPI } from "@/services/api";
import type { Source, Note, Podcast, SourceInsight, Transformation, PodcastTemplate } from "@/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotebookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [notebook, setNotebook] = useState<Notebook | null>(location.state?.notebook || null);
  const [loading, setLoading] = useState(!notebook);
  
  // Panel states
  const [isSourceExpanded, setIsSourceExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isViewingNote, setIsViewingNote] = useState(false);
  const [isLoadingNoteContent, setIsLoadingNoteContent] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);
  const [showRenameNoteModal, setShowRenameNoteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [noteToRename, setNoteToRename] = useState<Note | null>(null);
  const [showDeletePodcastModal, setShowDeletePodcastModal] = useState(false);
  const [podcastToDelete, setPodcastToDelete] = useState<Podcast | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data states
  const [sources, setSources] = useState<Source[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [podcastPrompt, setPodcastPrompt] = useState("");
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [playingPodcast, setPlayingPodcast] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [podcastSettings, setPodcastSettings] = useState({
    episodeName: "",
    template: "",
    length: "Short (5-10 min)",
    maxChunks: 5,
    minChunkSize: 3
  });
  
  // Add/Discover form states
  const [showAddSourceForm, setShowAddSourceForm] = useState(false);
  const [showDiscoverForm, setShowDiscoverForm] = useState(false);
  const [sourceType, setSourceType] = useState<"link" | "upload" | "text">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [selectedTransformation, setSelectedTransformation] = useState("");
  const [transformationResults, setTransformationResults] = useState<Record<string, string>>({});
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [podcastTemplates, setPodcastTemplates] = useState<PodcastTemplate[]>([]);
  const [loadingPodcastTemplates, setLoadingPodcastTemplates] = useState(false);
  const [loadingTransformations, setLoadingTransformations] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<SourceInsight | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const [sourceToRename, setSourceToRename] = useState<Source | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    console.log("NotebookDetail useEffect - notebook:", notebook, "id:", id);
    if (!notebook && id) {
      console.log("Loading notebook...");
      loadNotebook();
    } else if (id) {
      console.log("Loading data...");
      loadData();
    }
  }, [id, notebook]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);

  const loadNotebook = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await notebookAPI.get(id);
      setNotebook(data);
      loadData();
    } catch (error) {
      toast({
        title: "Error loading notebook",
        description: "Failed to load notebook details.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadTransformations = async () => {
    try {
      console.log("🔄 Loading transformations...");
      setLoadingTransformations(true);
      const data = await transformationsAPI.list('name', 'asc');
      console.log("📊 Received transformations:", data);
      setTransformations(data || []);
    } catch (error) {
      console.error("❌ Error loading transformations:", error);
      toast({
        title: "Error",
        description: "Failed to load transformations",
        variant: "destructive",
      });
    } finally {
      setLoadingTransformations(false);
    }
  };

  const loadPodcastTemplates = async () => {
    setLoadingPodcastTemplates(true);
    try {
      console.log("Loading podcast templates...");
      const templates = await podcastsAPI.getTemplates();
      console.log("✅ Podcast templates loaded:", templates);
      setPodcastTemplates(templates);
      
      // Set default template to first available template
      if (templates.length > 0 && !podcastSettings.template) {
        setPodcastSettings(prev => ({
          ...prev,
          template: templates[0].name
        }));
      }
    } catch (error) {
      console.error("❌ Error loading podcast templates:", error);
      toast({
        title: "Error",
        description: "Failed to load podcast templates",
        variant: "destructive",
      });
    } finally {
      setLoadingPodcastTemplates(false);
    }
  };

  const loadData = async () => {
    if (!id || !notebook) return;
    
    console.log("Loading data for notebook:", id, "name:", notebook.name);
    
    // Load transformations
    await loadTransformations();
    
    // Load podcast templates
    await loadPodcastTemplates();
    
    // Load sources (this works)
    try {
      const sourcesData = await sourcesAPI.listByNotebookName(notebook.name);
      console.log("✅ Sources loaded:", sourcesData);
      
      // Debug insights in each source
      if (Array.isArray(sourcesData)) {
        sourcesData.forEach((source, index) => {
          console.log(`🔍 Source ${index} (${source.title}):`, source);
          console.log(`🔍 Source ${index} insights:`, source.insights);
        });
      }
      
      setSources(sourcesData);
    } catch (error) {
      console.error("❌ Error loading sources:", error);
    }
    
    // Load notes using notebook name (this might fail, but we'll handle it gracefully)
    try {
      console.log("🔍 Loading notes for notebook name:", notebook.name);
      const notesData = await notesAPI.listByNotebookName(notebook.name);
      console.log("✅ Notes loaded:", notesData);
      console.log("📊 Notes count:", notesData?.length || 0);
      setNotes(notesData);
    } catch (error) {
      console.error("❌ Error loading notes:", error);
      setNotes([]); // Set empty array if notes fail
    }
    
    // Load podcasts using notebook name (this might fail, but we'll handle it gracefully)
    try {
      console.log("🔍 Loading podcasts for notebook name:", notebook.name);
      const podcastsData = await podcastsAPI.listByNotebookName(notebook.name);
      console.log("✅ Podcasts loaded:", podcastsData);
      console.log("📊 Podcasts count:", podcastsData?.length || 0);
      setPodcasts(podcastsData);
    } catch (error) {
      console.error("❌ Error loading podcasts:", error);
      setPodcasts([]); // Set empty array if podcasts fail
    }
  };

  const handleSourceSelect = (source: Source) => {
    setSelectedSource(source);
    setShowAddSourceForm(false); // Hide add form
    setShowDiscoverForm(false); // Hide discover form
    setIsSourceExpanded(true);
    
    // Clear transformation results since we'll show individual insights
    setTransformationResults({});
    setSelectedInsight(null); // Clear selected insight when switching sources
  };

  const handleInsightSelect = (insight: SourceInsight) => {
    setSelectedInsight(insight);
  };

  const handleBackToInsights = () => {
    setSelectedInsight(null);
  };
  
  const handleAddSourceClick = () => {
    setSelectedSource(null); // Clear any selected source
    setShowDiscoverForm(false); // Hide discover form
    setShowAddSourceForm(true);
    setIsSourceExpanded(true); // Trigger panel expansion
  };
  
  const handleDiscoverClick = () => {
    setSelectedSource(null); // Clear any selected source
    setShowAddSourceForm(false); // Hide add form
    setShowDiscoverForm(true);
    setIsSourceExpanded(true); // Trigger panel expansion
  };

  const handleCloseSourceView = () => {
    setIsSourceExpanded(false);
    setSelectedSource(null);
    setShowAddSourceForm(false);
    setShowDiscoverForm(false);
    setShowSearchResults(false);
    setSearchResults([]);
    setUrlInput("");
    setTextInput("");
    setDiscoverQuery("");
    setSelectedTransformation("");
    setTransformationResults({});
  };

  const handleTransformationRun = async () => {
    if (!selectedTransformation || !selectedSource) return;
    
    try {
      toast({
        title: "Processing transformation",
        description: `Applying ${selectedTransformation} to source...`,
      });
      
      console.log("🔍 NotebookDetail: Running transformation:", selectedTransformation, "on source:", selectedSource.title);
      
      // Call the real transformation API
      const result = await sourcesAPI.runTransformationsByTitle(selectedSource.title, selectedTransformation);
      
      console.log("✅ NotebookDetail: Transformation result:", result);
      
      // Clear transformation results since insights will be displayed individually
      setTransformationResults({});
      
      toast({
        title: "Transformation complete",
        description: `${selectedTransformation} has been applied successfully.`,
      });
      
      // Immediately update the selected source with the new insight from the transformation result
      if (result && result.results && result.results.length > 0) {
        const transformationResult = result.results[0];
        if (transformationResult.success && transformationResult.output) {
          // Create a new insight object from the transformation result
          const newInsight = {
            id: `temp_${Date.now()}`, // Temporary ID
            insight_type: selectedTransformation,
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
          
          console.log("✅ NotebookDetail: Updated source with new insight immediately");
        }
      }
      
      // Also reload all data to get the latest from the backend
      await loadData();
      
    } catch (error) {
      console.error("❌ NotebookDetail: Transformation error:", error);
      
      toast({
        title: "Transformation failed",
        description: "Failed to apply transformation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRenameSource = async () => {
    if (!renameTitle.trim() || !sourceToRename) return;
    
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
      setRenameTitle("");
      setSourceToRename(null);
      setShowRenameModal(false);
      await loadData(); // Reload to get updated data
    } catch (error) {
      console.error("❌ NotebookDetail: Error renaming source:", error);
      toast({
        title: "Rename failed",
        description: "Failed to rename source. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const openRenameModal = (source: Source) => {
    setSourceToRename(source);
    setRenameTitle(source.title);
    setShowRenameModal(true);
  };

  const handleDeleteSource = async () => {
    if (!selectedSource) return;
    
    try {
      console.log("🗑️ NotebookDetail: Deleting source:", selectedSource.title, "ID:", selectedSource.id);
      
      // Use the source ID for delete if title is empty, otherwise use title
      let deleteResult;
      if (selectedSource.title && selectedSource.title.trim()) {
        console.log("🗑️ Using deleteByTitle for:", selectedSource.title);
        deleteResult = await sourcesAPI.deleteByTitle(selectedSource.title);
      } else {
        console.log("🗑️ Using delete by ID for:", selectedSource.id);
        deleteResult = await sourcesAPI.delete(selectedSource.id);
      }
      
      console.log("✅ NotebookDetail: Delete result:", deleteResult);
      
      toast({
        title: "Source deleted",
        description: `Source "${selectedSource.title || 'Untitled'}" has been deleted successfully.`,
      });
      
      // Clear the selected source and related state
      setSelectedSource(null);
      setSelectedInsight(null);
      setTransformationResults({});
      setShowDeleteConfirm(false);
      
      // Reload all data to get updated data
      await loadData();
      
      console.log("✅ NotebookDetail: Source deletion completed successfully");
      
    } catch (error) {
      console.error("❌ NotebookDetail: Error deleting source:", error);
      
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

  const handleSaveAsNote = async (transformation: string, content: string) => {
    if (!id || !selectedSource || !selectedInsight) return;
    
    try {
      console.log("💾 Saving insight as note:", {
        sourceId: selectedSource.id,
        insightId: selectedInsight.id,
        notebookId: id,
        transformation,
        content: content.substring(0, 100) + "..."
      });
      
      // Use the new API endpoint that properly handles source insights
      await sourcesAPI.saveInsightAsNote(selectedSource.id, selectedInsight.id, id);
      
      toast({
        title: "Note saved",
        description: `${transformation} result has been saved as a note.`,
      });
      
      // Reload notes to show the new note in Studio panel
      loadData();
    } catch (error) {
      console.error("❌ Error saving insight as note:", error);
      toast({
        title: "Failed to save note",
        description: "Could not save the transformation result as a note.",
        variant: "destructive",
      });
    }
  };

  const handleSaveNote = async () => {
    if (!id || !noteTitle?.trim() || !noteContent?.trim()) return;

    try {
      if (expandedNoteId) {
        await notesAPI.update(expandedNoteId, {
          title: noteTitle,
          content: noteContent,
        });
        toast({
          title: "Note updated",
          description: "Your note has been updated successfully.",
        });
      } else {
        console.log("🔄 Creating new note with data:", { notebook_name: notebook.name, title: noteTitle, content: noteContent });
        const createdNote = await notesAPI.createInNotebook(notebook.name, {
          title: noteTitle,
          content: noteContent,
        });
        console.log("✅ Note created successfully:", createdNote);
        toast({
          title: "Note created",
          description: "Your note has been created successfully.",
        });
      }
      setIsCreatingNote(false);
      setExpandedNoteId(null);
      setNoteTitle("");
      setNoteContent("");
      
      // Add a small delay to ensure backend has processed the note creation
      console.log("🔄 Refreshing data after note creation...");
      setTimeout(() => {
        loadData();
      }, 500);
    } catch (error) {
      toast({
        title: "Error saving note",
        description: "Failed to save note.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!id) return;
    
    try {
      await notesAPI.delete(noteId);
      toast({
        title: "Note deleted",
        description: "The note has been deleted successfully.",
      });
      loadData();
      setShowDeleteNoteModal(false);
      setNoteToDelete(null);
    } catch (error) {
      toast({
        title: "Error deleting note",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  const handleRenameNote = async () => {
    if (!noteToRename || !newNoteTitle.trim()) return;
    
    try {
      await notesAPI.update(noteToRename.id, { title: newNoteTitle.trim() });
      toast({
        title: "Note renamed",
        description: "The note has been renamed successfully.",
      });
      loadData(); // Reload data to update the UI
      setShowRenameNoteModal(false);
      setNoteToRename(null);
      setNewNoteTitle("");
    } catch (error) {
      console.error("Error renaming note:", error);
      toast({
        title: "Error",
        description: "Failed to rename the note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDeleteModal = (note: Note) => {
    setNoteToDelete(note);
    setShowDeleteNoteModal(true);
  };

  const openRenameNoteModal = (note: Note) => {
    setNoteToRename(note);
    setNewNoteTitle(note.title);
    setShowRenameNoteModal(true);
  };

  const handleViewNote = async (note: Note) => {
    console.log("Viewing note:", note);
    console.log("Note content:", note.content);
    
    setIsViewingNote(true);
    setIsCreatingNote(false);
    setExpandedNoteId(null);
    setIsLoadingNoteContent(true);
    
    try {
      // Fetch the full note content using the title
      const fullNote = await notesAPI.getByTitle(note.title);
      console.log("Full note fetched:", fullNote);
      setViewingNote(fullNote);
    } catch (error) {
      console.error("Error fetching full note content:", error);
      // Fallback to the note from the list if API call fails
      setViewingNote(note);
    } finally {
      setIsLoadingNoteContent(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setExpandedNoteId(note.id);
    setIsCreatingNote(true);
    setIsViewingNote(false);
    setViewingNote(null);
  };

  const handlePlayPodcast = async (podcast: any) => {
    try {
      // Use the podcast name as the episode identifier
      const podcastId = podcast.name || podcast.id;
      
      console.log('Original podcast data:', podcast);
      console.log('Using podcast ID/name:', podcastId);
      
      // If the same podcast is already playing, stop it
      if (playingPodcast === podcast.id) {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
          setPlayingPodcast(null);
          setAudioElement(null);
        }
        return;
      }
      
      // Stop any currently playing audio
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        setAudioElement(null);
      }
      
      // Get the audio URL using the podcast name/ID
      const fullAudioUrl = podcastsAPI.getAudio(podcastId);
      console.log('Setting audio source to:', fullAudioUrl);
      
      // Create new audio element
      const newAudio = new Audio(fullAudioUrl);
      newAudio.crossOrigin = 'anonymous';
      newAudio.preload = 'none';
      
      // Store the new audio element
      setAudioElement(newAudio);
      
      // Set up event listeners
      newAudio.onplay = () => {
        console.log('Playback started');
        setPlayingPodcast(podcast.id);
      };
      
      newAudio.onerror = (e) => {
        console.error('Audio element error:', e);
        setPlayingPodcast(null);
        setAudioElement(null);
        handlePlaybackError(e);
      };
      
      newAudio.onended = () => {
        console.log('Playback ended');
        setPlayingPodcast(null);
        setAudioElement(null);
      };
      
      // Start playing the audio
      await newAudio.play().catch(e => {
        console.error('Error playing audio:', e);
        handlePlaybackError(e);
      });
      
    } catch (error) {
      console.error('Error in handlePlayPodcast:', error);
      handlePlaybackError(error);
      setPlayingPodcast(null);
      setAudioElement(null);
    }
  };
  
  const handlePlaybackError = (error: any) => {
    console.error('Playback error details:', error);
    toast({
      title: "Playback Error",
      description: error.message || "Failed to play podcast audio. Please try again.",
      variant: "destructive",
    });
    setPlayingPodcast(null);
    setAudioElement(null);
  };

  const handleGeneratePodcast = async () => {
    if (!id || !podcastPrompt?.trim()) return;
    
    setIsGeneratingPodcast(true);
    try {
      await podcastsAPI.generate({
        template_name: "Deep Dive",
        notebook_name: notebook?.name || "Unknown",
        episode_name: `Episode ${new Date().toLocaleString()}`,
        instructions: podcastPrompt,
        podcast_length: "Medium (10-20 min)",
      });
      toast({
        title: "Podcast generation started",
        description: "Your podcast is being generated. This may take a few minutes.",
      });
      setPodcastPrompt("");
      
      // Immediately refresh to show the new podcast if it's generated quickly
      setTimeout(async () => {
        try {
          const updatedPodcasts = await podcastsAPI.listByNotebookName(notebook?.name || "Unknown");
          setPodcasts(updatedPodcasts);
        } catch (error) {
          console.error("Error refreshing podcasts immediately:", error);
        }
      }, 1000);
      
      // Poll for updates - check if new episodes were created
      const initialCount = podcasts.length;
      const pollInterval = setInterval(async () => {
        try {
          const updatedPodcasts = await podcastsAPI.listByNotebookName(notebook?.name || "Unknown");
          setPodcasts(updatedPodcasts);
          
          // If we have more episodes than before, generation is complete
          if (updatedPodcasts.length > initialCount) {
            clearInterval(pollInterval);
            setIsGeneratingPodcast(false);
            toast({
              title: "Podcast generated successfully!",
              description: "Your podcast is now available in the Studio panel.",
            });
          }
        } catch (error) {
          console.error("Error polling for podcasts:", error);
          clearInterval(pollInterval);
          setIsGeneratingPodcast(false);
        }
      }, 3000);
      
      // Set a timeout to stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsGeneratingPodcast(false);
      }, 300000);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate podcast.",
        variant: "destructive",
      });
      setIsGeneratingPodcast(false);
    }
  };


  // Add Source handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !notebook) return;

    setIsAddingSource(true);
    try {
      const formData = new FormData();
      formData.append('type', 'upload');
      formData.append('file', files[0]);
      
      await sourcesAPI.createByNotebookName(notebook.name, formData);
      toast({
        title: "File uploaded",
        description: "Your file has been added to the notebook.",
      });
      loadData();
      handleCloseSourceView();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim() || !notebook) return;

    setIsAddingSource(true);
    try {
      const isYoutube = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
      const formData = new FormData();
      formData.append('type', 'link');
      formData.append('url', urlInput);
      
      await sourcesAPI.createByNotebookName(notebook.name, formData);
      toast({
        title: "URL added",
        description: "The URL has been added to your notebook.",
      });
      setUrlInput("");
      loadData();
      handleCloseSourceView();
    } catch (error) {
      toast({
        title: "Failed to add URL",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !notebook) return;

    setIsAddingSource(true);
    try {
      const formData = new FormData();
      formData.append('type', 'text');
      formData.append('content', textInput);
      
      await sourcesAPI.createByNotebookName(notebook.name, formData);
      toast({
        title: "Text added",
        description: "Your text has been added to the notebook.",
      });
      setTextInput("");
      loadData();
      handleCloseSourceView();
    } catch (error) {
      toast({
        title: "Failed to add text",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleDiscoverSubmit = async () => {
    if (!discoverQuery.trim()) return;

    console.log("🚀 Starting discovery with query:", discoverQuery);
    setIsDiscovering(true);
    try {
      toast({
        title: "Discovering sources",
        description: `Finding sources related to: ${discoverQuery}`,
      });
      
      console.log("📡 Calling serperAPI.search...");
      // Call Serper API to search for relevant sources
      const searchResponse = await serperAPI.search(discoverQuery, {
        num_results: 10
      });

      console.log("🔍 Search results received:", searchResponse);
      console.log("📊 Results array:", searchResponse.results);
      console.log("📊 Results length:", searchResponse.results?.length);
      
      setSearchResults(searchResponse.results || []);
      setShowSearchResults(true);
      setShowDiscoverForm(false);
      
      toast({
        title: "Sources discovered",
        description: `Found ${searchResponse.results?.length || 0} relevant sources`,
      });
    } catch (error) {
      console.error("❌ Discovery failed:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error stack:", error.stack);
      toast({
        title: "Discovery failed",
        description: "Failed to search for sources. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddDiscoveredSource = async (result: any) => {
    console.log("🚀 Adding discovered source:", result);
    try {
      setIsAddingSource(true);
      
      // Create a source from the search result
      const formData = new FormData();
      formData.append('title', result.title);
      formData.append('type', 'link');
      formData.append('url', result.link);
      formData.append('content', result.snippet || '');
      
      console.log("📝 FormData contents:");
      console.log("  - title:", result.title);
      console.log("  - type: link");
      console.log("  - url:", result.link);
      console.log("  - content:", result.snippet);
      console.log("  - notebook name:", notebook.name);
      
      console.log("📡 Calling sourcesAPI.createByNotebookName...");
      const response = await sourcesAPI.createByNotebookName(notebook.name, formData);
      console.log("✅ Source created successfully:", response);
      
      toast({
        title: "Source added",
        description: `"${result.title}" has been added to your notebook`,
      });
      
      console.log("🔄 Reloading data...");
      // Reload sources to show the new one
      await loadData();
      
      // Remove the added source from search results
      setSearchResults(prev => prev.filter(r => r.link !== result.link));
      console.log("✅ Source added and removed from search results");
      
    } catch (error) {
      console.error("❌ Failed to add source:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error stack:", error.stack);
      toast({
        title: "Failed to add source",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleDeletePodcast = async () => {
    if (!podcastToDelete) return;
    
    try {
      await podcastsAPI.delete(podcastToDelete.id);
      toast({
        title: "Podcast deleted successfully",
        description: "The podcast has been removed from your notebook.",
      });
      await loadData(); // Reload data to update the UI
    } catch (error) {
      console.error("Error deleting podcast:", error);
      toast({
        title: "Failed to delete podcast",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeletePodcastModal(false);
      setPodcastToDelete(null);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "url":
        return "🔗";
      case "text":
        return "📝";
      default:
        return "📎";
    }
  };

  if (loading) {
    console.log("NotebookDetail - Loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!notebook) {
    console.log("NotebookDetail - No notebook found");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Notebook not found</h2>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notebooks
        </Button>
      </div>
    );
  }

  console.log("NotebookDetail - Rendering with notebook:", notebook, "sources:", sources, "notes:", notes, "podcasts:", podcasts);
  console.log("🔍 NotebookDetail: Component rendering - sources.length:", sources.length, "isSourceExpanded:", isSourceExpanded);
  console.log("🔍 NotebookDetail: Will show sources list?", !isSourceExpanded);
  console.log("🔍 NotebookDetail: Sources array:", sources);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate">{notebook.name}</h1>
              </div>
            </div>
            

            {/* Mobile Menu */}
            <div className="sm:hidden shrink-0">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px]">
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <h2 className="text-lg font-semibold">Actions</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tabs Navigation */}
      <div className="sm:hidden border-b animate-slide-in-top">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources" className="animate-tab-switch animate-stagger-1">Sources</TabsTrigger>
            <TabsTrigger value="chat" className="animate-tab-switch animate-stagger-2">Chat</TabsTrigger>
            <TabsTrigger value="studio" className="animate-tab-switch animate-stagger-3">Studio</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop Three Panel Layout */}
      <div className="hidden sm:flex h-[calc(100vh-65px)] gap-3 lg:gap-6 p-3 lg:p-6 bg-gradient-to-br from-background via-background to-muted/20 animate-layout-transition">
        {/* Left Panel - Sources */}
        {(() => { console.log("🔍 NotebookDetail: Rendering left panel - isSourceExpanded:", isSourceExpanded); return null; })()}
        <div className={cn(
          "bg-card border border-border/50 transition-all duration-500 ease-out flex flex-col rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm animate-panel-slide-in panel-content",
          // When both panels are expanded, they share space equally
          isSourceExpanded && (isCreatingNote || isViewingNote || showPodcastForm) ? "flex-1 animate-panel-expand" : 
          // When only source panel is expanded
          isSourceExpanded ? "w-[500px] lg:w-[600px] animate-panel-expand" : 
          // When source panel is collapsed
          "w-80 lg:w-96 animate-panel-collapse"
        )}>
          {!isSourceExpanded && (
          <div className="p-3 lg:p-4 border-b">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h2 className="text-base lg:text-lg font-semibold">Sources</h2>
              <div className="flex gap-1 lg:gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleAddSourceClick}
                    className="transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md animate-bounce-in"
                  >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button 
                  size="sm" 
                    variant="outline"
                    onClick={handleDiscoverClick}
                    className="transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md animate-bounce-in"
                >
                  Discover
                </Button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search sources..."
              className="w-full px-3 py-2 rounded-xl border bg-background text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          )}


          {(() => { console.log("🔍 NotebookDetail: isSourceExpanded:", isSourceExpanded, "Will render sources list?"); return null; })()}
          {!isSourceExpanded ? (
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
              <div className="p-4 space-y-1 w-full overflow-hidden">
                  {(() => { console.log("🔍 NotebookDetail: Rendering sources - sources.length:", sources.length, "sources:", sources); return null; })()}
                  {sources.length > 0 ? (
                    sources.map((source, index) => (
                  <Card
                    key={source.id}
                    className={cn(
                      "group p-2 cursor-pointer hover:bg-accent/50 transition-all duration-300 w-full hover:scale-[1.02] hover:shadow-md",
                      "animate-stagger-in",
                      `animate-stagger-${Math.min(index + 1, 6)}`
                    )}
                    onClick={() => handleSourceSelect(source)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      openRenameModal(source);
                    }}
                  >
                        <div className="flex items-center gap-2 w-full">
                      <div className="flex-shrink-0">
                        <span className="text-sm">{getSourceIcon(source.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="font-medium text-sm leading-tight break-words" title={source.title}>
                            {source.title}
                          </p>
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
                  </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground mb-4">
                        <FileText className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">No sources added yet</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddSourceClick}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Source
                      </Button>
                    </div>
                  )}
              </div>
            </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCloseSourceView}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">
                    {showAddSourceForm ? "Add a Source" : 
                     showDiscoverForm ? "Discover sources" : 
                     showSearchResults ? "Search Results" :
                     selectedSource?.title || "Source Details"}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSource && !showAddSourceForm && !showDiscoverForm && !showSearchResults && (
                    <div className="flex items-center gap-2">
                      <Select value={selectedTransformation} onValueChange={setSelectedTransformation} disabled={loadingTransformations}>
                        <SelectTrigger className="w-[180px] h-8">
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
                        onClick={handleTransformationRun}
                        disabled={!selectedTransformation}
                        size="sm"
                        className="h-8"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                    </div>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCloseSourceView}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  {/* Show Add Source Form */}
                  {showAddSourceForm && (
                    <div className="space-y-6 relative">
                      {/* Loading Overlay */}
                      {isAddingSource && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">Adding source...</p>
                          </div>
                        </div>
                      )}
                      {/* Source Type Tabs */}
                      <div className="flex space-x-1 bg-muted p-1 rounded-xl">
                        <button
                          onClick={() => setSourceType("upload")}
                          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                            sourceType === "upload"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          onClick={() => setSourceType("link")}
                          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                            sourceType === "link"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Add URL
                        </button>
                        <button
                          onClick={() => setSourceType("text")}
                          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                            sourceType === "text"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Text
                        </button>
                      </div>

                      {sourceType === "upload" && (
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center">
                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input
                                type="file"
                                onChange={handleFileUpload}
                                accept=".pdf,.txt,.doc,.docx"
                                className="hidden"
                                id="file-upload"
                              />
                              <Button 
                                variant="outline" 
                                size="lg"
                                onClick={() => document.getElementById('file-upload')?.click()}
                                className="px-6"
                                disabled={isAddingSource}
                              >
                                Choose Files
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {sourceType === "link" && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label htmlFor="url-input" className="text-sm font-medium">URL</Label>
                            <Input
                              id="url-input"
                              placeholder="Enter URL (website or YouTube)..."
                              value={urlInput}
                              onChange={(e) => setUrlInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                              className="h-12"
                              disabled={isAddingSource}
                            />
                            <Button 
                              onClick={handleUrlSubmit}
                              className="w-full h-12"
                              disabled={!urlInput.trim() || isAddingSource}
                            >
                              <Link className="h-4 w-4 mr-2" />
                              Add URL
                            </Button>
                          </div>
                        </div>
                      )}

                      {sourceType === "text" && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label htmlFor="text-input" className="text-sm font-medium">Text Content</Label>
                            <Textarea
                              id="text-input"
                              placeholder="Enter or paste your text here..."
                              value={textInput}
                              onChange={(e) => setTextInput(e.target.value)}
                              className="min-h-[200px] resize-none"
                              disabled={isAddingSource}
                            />
                            <Button 
                              onClick={handleTextSubmit}
                              className="w-full h-12"
                              disabled={!textInput.trim() || isAddingSource}
                            >
                              <Type className="h-4 w-4 mr-2" />
                              Add Text
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show Discover Form */}
                  {showDiscoverForm && (
                    <div className="space-y-6">
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2">What are you interested in?</h4>
                      </div>

                      <div className="space-y-4">
                        <Textarea
                          placeholder="Describe something that you'd like to learn about or click 'I'm feeling curious' to explore a new topic."
                          value={discoverQuery}
                          onChange={(e) => setDiscoverQuery(e.target.value)}
                          className="min-h-[120px] resize-none"
                        />
                        
                        {!discoverQuery && (
                          <p className="text-xs text-destructive">Please fill out this field.</p>
                        )}

                        <div className="flex gap-3">
                          <Button 
                            onClick={handleDiscoverSubmit}
                            className="flex-1"
                            disabled={!discoverQuery.trim() || isDiscovering}
                          >
                            {isDiscovering ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Discovering...
                              </>
                            ) : (
                              "Discover Sources"
                            )}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setDiscoverQuery("I'm feeling curious")}
                            className="flex-1"
                            disabled={isDiscovering}
                          >
                            I'm feeling curious
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show Search Results */}
                  {showSearchResults && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Search Results</h3>
                          <p className="text-sm text-muted-foreground">
                            Found {searchResults.length} sources for "{discoverQuery}"
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchResults([]);
                            setDiscoverQuery("");
                          }}
                          disabled={isAddingSource}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                                  <h4 className="font-medium text-sm line-clamp-2">
                                    {result.title}
                                  </h4>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {result.snippet}
                                </p>
                                <a 
                                  href={result.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {new URL(result.link).hostname}
                                </a>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddDiscoveredSource(result)}
                                disabled={isAddingSource}
                                className="flex-shrink-0"
                              >
                                {isAddingSource ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show Source Content */}
                  {selectedSource && !showAddSourceForm && !showDiscoverForm && !showSearchResults && (
                    <div className="h-full flex flex-col">

                      {/* Content Area */}
                      <div className="flex-1 pr-1 flex flex-col">
                        <div className="space-y-2 p-1 w-full max-w-full flex-1 flex flex-col">
                          {/* Show individual insights or selected insight content */}
                          {selectedSource?.insights && selectedSource.insights.length > 0 && (
                            <div className="space-y-2 w-full max-w-full flex-1 flex flex-col">
                              {selectedInsight ? (
                                // Show selected insight content
                                <div className="w-full max-w-full flex-1 flex flex-col">
                                  <div className="flex items-center gap-2 mb-2 flex-shrink-0 -mt-1 -ml-2">
                                    <Button
                                      onClick={handleBackToInsights}
                                      variant="ghost"
                                      size="sm"
                                      className="p-1 h-8 w-8"
                                    >
                                      <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                                      <Sparkles className="h-4 w-4" />
                                      {selectedInsight.insight_type || selectedInsight.type || 'Insight'}
                                    </h3>
                                  </div>
                                  <div className="w-full max-w-full relative" style={{ height: 'calc(100vh - 280px)' }}>
                                    <div className="h-full overflow-y-auto w-full max-w-full border border-primary/20 rounded-lg bg-primary/5">
                                      <div className="p-2 pb-16">
                                        <p className="text-sm whitespace-pre-wrap break-words w-full max-w-full overflow-x-hidden">
                                          {selectedInsight.content}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 pb-3 bg-primary/5 border-t border-primary/20 rounded-b-lg">
                                      <Button 
                                        onClick={() => handleSaveAsNote(selectedInsight.insight_type || selectedInsight.type || 'Insight', selectedInsight.content)}
                                        size="sm"
                                        variant="outline"
                                        className="w-full max-w-full"
                                      >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Save as Note
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Show insights list
                                <>
                                  <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Transformation Insights ({selectedSource.insights.length})
                                  </h3>
                                  <div className="space-y-2 w-full max-w-full">
                                    {selectedSource.insights.map((insight, index) => (
                                      <div 
                                        key={insight.id || index} 
                                        className="w-full max-w-full p-2 bg-primary/5 border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
                                        onClick={() => handleInsightSelect(insight)}
                                      >
                                        <div className="flex items-center justify-between w-full max-w-full">
                                          <span className="font-semibold text-sm text-primary truncate flex-1 mr-2 min-w-0 max-w-full">
                                            {insight.insight_type || insight.type || `Insight ${index + 1}`}
                                          </span>
                                          <span className="text-primary/60 flex-shrink-0">→</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Panel - Chat */}
        {!(isSourceExpanded && (isCreatingNote || isViewingNote || showPodcastForm)) && (
        <div className="flex-1 bg-card border border-border/50 rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm animate-panel-show animate-stagger-2 panel-content">
            <ChatPanel notebookId={notebook.id} onNoteSaved={loadData} />
        </div>
        )}

        {/* Right Panel - Studio */}
        <div className={cn(
          "bg-card border border-border/50 transition-all duration-500 ease-out flex flex-col rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm animate-panel-slide-in animate-stagger-3 panel-content",
          // When both panels are expanded, they share space equally
          isSourceExpanded && (isCreatingNote || isViewingNote || showPodcastForm) ? "flex-1 animate-panel-expand" : 
          // When only studio panel is expanded (source panel collapsed)
          (isCreatingNote || isViewingNote || showPodcastForm) ? "w-[600px] animate-panel-expand" : 
          // When studio panel is collapsed
          "w-96 animate-panel-collapse"
        )}>
          {!isCreatingNote && !isViewingNote && !showPodcastForm ? (
            <>
              {/* Studio Header */}
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold mb-4">Studio</h2>
                
                {/* Generate Podcast Button */}
                <Button 
                  className="w-full mb-4 bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-md touch-manipulation"
                  onClick={() => setShowPodcastForm(true)}
                  disabled={isGeneratingPodcast}
                >
                  <AudioLines className="h-4 w-4 mr-2" />
                  {isGeneratingPodcast ? "Generating Podcast..." : "Generate Podcast"}
                </Button>

                {/* Create Note Button */}
                <Button 
                  className="w-full mb-4 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-md touch-manipulation"
                  onClick={() => setIsCreatingNote(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add note
                </Button>
              </div>

              {/* Notes and Podcasts List */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {/* Recent Notes */}
                  {notes.length > 0 && (
                    <div>
                      <div className="space-y-2">
                        {notes.map((note, index) => (
                          <div
                            key={note.id}
                            className={cn(
                              "flex items-start justify-between p-2 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-all duration-300 gap-2 touch-manipulation",
                              "hover:scale-[1.02] hover:shadow-md active:scale-95 active:shadow-sm",
                              "animate-stagger-in",
                              `animate-stagger-${Math.min(index + 1, 6)}`
                            )}
                            onClick={() => handleViewNote(note)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                <FileText className="h-4 w-4 text-gray-500" />
                              </div>
                              <span className="text-sm font-medium text-gray-900 break-words leading-tight flex-1 min-w-0">
                                {note.title}
                              </span>
                            </div>
                            <div className="relative">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                    className="h-6 w-6 text-gray-500 hover:text-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="z-[9999] min-w-[160px]">
                                  <DropdownMenuItem                                   onClick={() => openRenameNoteModal(note)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                  onClick={() => openDeleteModal(note)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Podcasts */}
                  {podcasts.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Generated Podcasts</h3>
                      <div className="space-y-2">
                        {podcasts.map((podcast, index) => (
                          <Card key={podcast.id} className={cn(
                            "p-3 bg-gray-800 border-gray-700 transition-all duration-300 touch-manipulation",
                            "hover:scale-[1.02] hover:shadow-lg active:scale-95 active:shadow-md",
                            "animate-stagger-in",
                            `animate-stagger-${Math.min(index + 1, 6)}`
                          )}>
                            <div className="flex items-center gap-3">
                              {/* Audio Wave Icon */}
                              <div className="flex-shrink-0 relative">
                                <div className="flex items-center space-x-1">
                                  <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                                  <div className="w-1 h-5 bg-purple-400 rounded-full"></div>
                                  <div className="w-1 h-2 bg-purple-400 rounded-full"></div>
                                  <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
                                  <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                                </div>
                                <div className="absolute -top-1 -right-1">
                                  <div className="w-2 h-2 bg-purple-400 rounded-full opacity-80"></div>
                                </div>
                              </div>
                              
                              {/* Title and Metadata */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-200 leading-tight break-words truncate">
                                  {podcast.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {podcast.duration ? `${Math.round(podcast.duration / 60)}:${String(Math.round(podcast.duration % 60)).padStart(2, '0')}` : 'Unknown'} • {new Date(podcast.created).toLocaleDateString()}
                                </p>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 flex-shrink-0 text-purple-400 hover:text-purple-300 hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
                                  onClick={() => handlePlayPodcast(podcast)}
                                >
                                  {playingPodcast === podcast.id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 flex-shrink-0 text-purple-400 hover:text-purple-300 hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                    <DropdownMenuItem 
                                      className="text-gray-200 hover:bg-gray-700"
                                      onClick={() => {
                                        const audioUrl = `http://localhost:8001${podcast.audio_url}`;
                                        const link = document.createElement('a');
                                        link.href = audioUrl;
                                        link.download = `${podcast.name}.mp3`;
                                        link.click();
                                      }}
                                    >
                                      <Download className="mr-2 h-4 w-4" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-400 hover:bg-gray-700"
                                      onClick={() => {
                                        setPodcastToDelete(podcast);
                                        setShowDeletePodcastModal(true);
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : showPodcastForm ? (
            /* Podcast Generation Form */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Audio Overview - Podcast Generation</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowPodcastForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a podcast episode from your notebook: <span className="font-semibold">{notebook.name}</span>
                    </p>
                  </div>

                  {/* Episode Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Episode Name *</label>
                    <input
                      type="text"
                      placeholder="Enter episode name..."
                      className="w-full px-3 py-2 rounded-lg border bg-background/50"
                      value={podcastSettings.episodeName}
                      onChange={(e) => setPodcastSettings({...podcastSettings, episodeName: e.target.value})}
                    />
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Template</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border bg-background/50"
                      value={podcastSettings.template}
                      onChange={(e) => setPodcastSettings({...podcastSettings, template: e.target.value})}
                      disabled={loadingPodcastTemplates}
                    >
                      {loadingPodcastTemplates ? (
                        <option value="">Loading templates...</option>
                      ) : (
                        podcastTemplates.map((template) => (
                          <option key={template.name} value={template.name}>
                            {template.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Podcast Length */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Podcast Length</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border bg-background/50"
                      value={podcastSettings.length}
                      onChange={(e) => setPodcastSettings({...podcastSettings, length: e.target.value})}
                    >
                      <option value="Short (5-10 min)">Short (5-10 min)</option>
                      <option value="Medium (10-20 min)">Medium (10-20 min)</option>
                      <option value="Long (20-30 min)">Long (20-30 min)</option>
                    </select>
                  </div>

                  {/* Max Number of Chunks */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Number of Chunks</label>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full"
                        value={podcastSettings.maxChunks}
                        onChange={(e) => setPodcastSettings({...podcastSettings, maxChunks: parseInt(e.target.value)})}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1</span>
                        <span>{podcastSettings.maxChunks}</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  {/* Min Chunk Size */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Chunk Size</label>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        className="w-full"
                        value={podcastSettings.minChunkSize}
                        onChange={(e) => setPodcastSettings({...podcastSettings, minChunkSize: parseInt(e.target.value)})}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1</span>
                        <span>{podcastSettings.minChunkSize}</span>
                        <span>10</span>
                      </div>
                    </div>
                  </div>

                  {/* Play Button Placeholder */}
                  <div className="flex justify-center py-6">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <AudioLines className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      if (!podcastSettings.episodeName?.trim()) {
                        toast({
                          title: "Episode name required",
                          description: "Please enter an episode name.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setIsGeneratingPodcast(true);
                      try {
                        await podcastsAPI.generate({
                          template_name: podcastSettings.template,
                          notebook_name: notebook?.name || "Unknown",
                          episode_name: podcastSettings.episodeName,
                          instructions: `Generate a ${podcastSettings.length} podcast episode`,
                          podcast_length: podcastSettings.length,
                        });
                        toast({
                          title: "Podcast generation started",
                          description: "Your podcast is being generated. This may take a few minutes.",
                        });
                        setShowPodcastForm(false);
                        setPodcastSettings({
                          episodeName: "",
                          template: "Deep Dive",
                          length: "Short (5-10 min)",
                          maxChunks: 5,
                          minChunkSize: 3
                        });
                        // Poll for updates - check if new episodes were created
                        const initialCount = podcasts.length;
                        const pollInterval = setInterval(async () => {
                          try {
                            const updatedPodcasts = await podcastsAPI.list(id!);
                            setPodcasts(updatedPodcasts);
                            
                            // If we have more episodes than before, generation is complete
                            if (updatedPodcasts.length > initialCount) {
                              clearInterval(pollInterval);
                              setIsGeneratingPodcast(false);
                              toast({
                                title: "Podcast generated successfully!",
                                description: "Your podcast is now available in the Studio panel.",
                              });
                            }
                          } catch (error) {
                            console.error("Error polling for podcasts:", error);
                            clearInterval(pollInterval);
                            setIsGeneratingPodcast(false);
                          }
                        }, 3000);
                        
                        // Set a timeout to stop polling after 5 minutes
                        setTimeout(() => {
                          clearInterval(pollInterval);
                          setIsGeneratingPodcast(false);
                        }, 300000);
                      } catch (error) {
                        toast({
                          title: "Generation failed",
                          description: "Failed to generate podcast.",
                          variant: "destructive",
                        });
                        setIsGeneratingPodcast(false);
                      }
                    }}
                    disabled={isGeneratingPodcast || !podcastSettings.episodeName?.trim()}
                  >
                    {isGeneratingPodcast ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        GENERATING...
                      </>
                    ) : (
                      "GENERATE"
                    )}
                  </Button>

                  {/* Progress indicator */}
                  {isGeneratingPodcast && (
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground">
                        Generating podcast episode... This may take a few minutes.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : isViewingNote && viewingNote ? (
            /* Note Viewer */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsViewingNote(false);
                      setViewingNote(null);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h3 className="font-semibold text-lg">{viewingNote.title}</h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditNote(viewingNote)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <div className="mb-4">
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                    (Saved responses are view only)
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  {isLoadingNoteContent ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-muted-foreground">Loading content...</div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {viewingNote.content || "No content available"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Note Editor */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">
                  {expandedNoteId ? "Edit Note" : "New Note"}
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNote}
                    disabled={!noteTitle?.trim() || !noteContent?.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setIsCreatingNote(false);
                      setExpandedNoteId(null);
                      setNoteTitle("");
                      setNoteContent("");
                    }}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 flex flex-col">
                <input
                  type="text"
                  placeholder="Note title..."
                  className="w-full px-3 py-2 rounded-lg border bg-background/50 font-semibold backdrop-blur-sm"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
                <textarea
                  placeholder="Start writing your note..."
                  className="w-full flex-1 px-3 py-2 rounded-lg border bg-background/50 resize-none min-h-[500px] backdrop-blur-sm"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Content - Unified Layout */}
      <div className="sm:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="sources" className="mt-0 h-[calc(100vh-120px)] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Sources Panel Header - Only show when not expanded */}
              {!isSourceExpanded && (
                <div className="p-3 sm:p-4 space-y-3 border-b bg-background/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-semibold">Sources</h2>
                    <div className="flex gap-1 sm:gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleAddSourceClick}
                        className="transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleDiscoverClick}
                        className="transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <span className="hidden sm:inline">Discover</span>
                        <span className="sm:hidden">Find</span>
                      </Button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Search sources..."
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {/* Add Source Form */}
              {showAddSourceForm && (
                <div className="p-4 border-b bg-muted/30 relative">
                  {/* Loading Overlay */}
                  {isAddingSource && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Adding source...</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Add Source</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAddSourceForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Tabs value={sourceType} onValueChange={(value) => setSourceType(value as "link" | "upload" | "text")} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </TabsTrigger>
                      <TabsTrigger value="link" className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        URL
                      </TabsTrigger>
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Text
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="mt-4">
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
                        </div>
                        <Button className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Files
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="link" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="url">URL</Label>
                          <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                          />
                        </div>
                        <Button className="w-full">
                          <Link className="h-4 w-4 mr-2" />
                          Add URL
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="text" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="text">Text Content</Label>
                          <Textarea
                            id="text"
                            placeholder="Paste your text here..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            rows={6}
                          />
                        </div>
                        <Button className="w-full">
                          <Type className="h-4 w-4 mr-2" />
                          Add Text
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Discover Form */}
              {showDiscoverForm && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Discover Sources</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDiscoverForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="discover">Search Query</Label>
                      <Input
                        id="discover"
                        placeholder="What are you looking for?"
                        value={discoverQuery}
                        onChange={(e) => setDiscoverQuery(e.target.value)}
                      />
                    </div>
                    <Button className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Discover Sources
                    </Button>
                  </div>
                </div>
              )}

              {/* Source Content - Show when source is selected */}
              {selectedSource && (
                <div className="flex-1 flex flex-col bg-background">
                  {/* Mobile-optimized header */}
                  <div className="p-3 border-b bg-muted/30">
                    <div className="space-y-3">
                      {/* Title and close button row */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate text-sm pr-2">{selectedSource.title}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCloseSourceView}
                          className="shrink-0 h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    
                    {/* Transformation controls - only show when not viewing a specific insight */}
                    {!selectedInsight && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                        <Select value={selectedTransformation} onValueChange={setSelectedTransformation} disabled={loadingTransformations}>
                          <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs sm:text-sm">
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
                          onClick={handleTransformationRun}
                          disabled={!selectedTransformation}
                          size="sm"
                          className="h-8 text-xs sm:text-sm"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run
                        </Button>
                      </div>
                    )}
                  </div>

                  </div>
                  
                  {/* Individual Insights */}
                  {selectedSource?.insights && selectedSource.insights.length > 0 && (
                    <div className="flex-1 flex flex-col">
                      {selectedInsight ? (
                        // Show selected insight content
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center gap-2 p-3 border-b bg-muted/20">
                            <Button
                              onClick={handleBackToInsights}
                              variant="ghost"
                              size="sm"
                              className="p-1 h-8 w-8"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              {selectedInsight.insight_type || selectedInsight.type || 'Insight'}
                            </h3>
                          </div>
                          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                            <div className="p-4 pb-8">
                              <div className="prose prose-sm max-w-none">
                                <div className="text-sm whitespace-pre-wrap break-words leading-relaxed space-y-3">
                                  {selectedInsight.content}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 border-t bg-muted/20">
                            <Button
                              onClick={() => handleSaveAsNote(selectedInsight.insight_type || selectedInsight.type || 'Insight', selectedInsight.content)}
                              size="sm"
                              variant="outline"
                              className="w-full"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Save as Note
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Show insights list
                        <div className="flex-1 overflow-y-auto">
                          <div className="p-4">
                            <h3 className="font-semibold text-sm text-primary flex items-center gap-2 mb-3">
                              <Sparkles className="h-4 w-4" />
                              Transformation Insights ({selectedSource.insights.length})
                            </h3>
                            <div className="space-y-2">
                              {selectedSource.insights.map((insight, index) => (
                                <div 
                                  key={insight.id || index} 
                                  className="p-3 bg-primary/5 border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
                                  onClick={() => handleInsightSelect(insight)}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm text-primary truncate flex-1 mr-2">
                                      {insight.insight_type || insight.type || `Insight ${index + 1}`}
                                    </span>
                                    <span className="text-primary/60 flex-shrink-0">→</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* Sources List - Only show when not expanded */}
              {(() => { console.log("🔍 NotebookDetail Mobile: isSourceExpanded:", isSourceExpanded, "Will render mobile sources list?"); return null; })()}
              {!isSourceExpanded && (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 sm:p-4 w-full overflow-hidden">
                    <div className="space-y-2 w-full">
                      {(() => { console.log("🔍 NotebookDetail Mobile: Rendering sources - sources.length:", sources.length, "sources:", sources); return null; })()}
                      {sources.length > 0 ? (
                        sources.map((source) => (
                          <Card
                            key={source.id}
                            className="group p-3 cursor-pointer hover:bg-accent/50 transition-colors w-full"
                            onClick={() => handleSourceSelect(source)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              openRenameModal(source);
                            }}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <div className="flex-shrink-0 mt-0.5">
                                <span className="text-lg">{getSourceIcon(source.type)}</span>
                              </div>
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="font-medium text-sm break-words leading-tight mb-1" title={source.title}>
                                  {source.title}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {source.content || "No content available"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(source.created || source.created_at).toLocaleDateString()}
                                </p>
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
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-4" />
                          <p className="text-sm mb-2">No sources yet</p>
                          <p className="text-xs mb-4">Add your first source to get started</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                            onClick={handleAddSourceClick}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Source
                  </Button>
                </div>
              )}
            </div>
                  </div>
                </div>
              )}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden">
            <ChatPanel notebookId={notebook.id} onNoteSaved={loadData} />
          </div>
        </TabsContent>

        <TabsContent value="studio" className="mt-0 h-[calc(100vh-200px)] overflow-hidden rounded-xl">
          <div className="flex flex-col h-full">
            {!isCreatingNote && !showPodcastForm ? (
              <>
                {/* Studio Header */}
                <div className="p-4 space-y-4 border-b bg-background/50">
            <h2 className="text-lg font-semibold">Studio</h2>
            
                  {/* Generate Podcast Button */}
                <Button 
                    className="w-full mb-4 bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-md touch-manipulation touch-target"
                    onClick={() => setShowPodcastForm(true)}
                    disabled={isGeneratingPodcast}
                  >
                    <AudioLines className="h-4 w-4 mr-2" />
                    {isGeneratingPodcast ? "Generating Podcast..." : "Generate Podcast"}
                </Button>

            {/* Create Note Button */}
            <Button 
                    className="w-full mb-4 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-md touch-manipulation touch-target"
              onClick={() => setIsCreatingNote(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add note
            </Button>
                </div>
              </>
            ) : showPodcastForm ? (
              /* Podcast Generation Form */
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Audio Overview - Podcast Generation</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowPodcastForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Generate a podcast episode from your notebook: <span className="font-semibold">{notebook.name}</span>
                      </p>
                    </div>

                    {/* Episode Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Episode Name *</label>
                <input
                  type="text"
                        placeholder="Enter episode name..."
                        className="w-full px-3 py-2 rounded-lg border bg-background/50 text-sm"
                        value={podcastSettings.episodeName}
                        onChange={(e) => setPodcastSettings({...podcastSettings, episodeName: e.target.value})}
                      />
                    </div>

                    {/* Template Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Template</label>
                      <select
                        className="w-full px-3 py-2 rounded-lg border bg-background/50 text-sm"
                        value={podcastSettings.template}
                        onChange={(e) => setPodcastSettings({...podcastSettings, template: e.target.value})}
                        disabled={loadingPodcastTemplates}
                      >
                        {loadingPodcastTemplates ? (
                          <option value="">Loading templates...</option>
                        ) : (
                          podcastTemplates.map((template) => (
                            <option key={template.name} value={template.name}>
                              {template.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Podcast Length */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Podcast Length</label>
                      <select
                        className="w-full px-3 py-2 rounded-lg border bg-background/50 text-sm"
                        value={podcastSettings.length}
                        onChange={(e) => setPodcastSettings({...podcastSettings, length: e.target.value})}
                      >
                        <option value="Short (5-10 min)">Short (5-10 min)</option>
                        <option value="Medium (10-20 min)">Medium (10-20 min)</option>
                        <option value="Long (20-30 min)">Long (20-30 min)</option>
                      </select>
                    </div>

                    {/* Max Number of Chunks */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Number of Chunks</label>
                      <div className="relative">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          className="w-full"
                          value={podcastSettings.maxChunks}
                          onChange={(e) => setPodcastSettings({...podcastSettings, maxChunks: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1</span>
                          <span>{podcastSettings.maxChunks}</span>
                          <span>10</span>
                        </div>
                      </div>
                    </div>

                    {/* Min Chunk Size */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Min Chunk Size</label>
                      <div className="relative">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          className="w-full"
                          value={podcastSettings.minChunkSize}
                          onChange={(e) => setPodcastSettings({...podcastSettings, minChunkSize: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1</span>
                          <span>{podcastSettings.minChunkSize}</span>
                          <span>10</span>
                        </div>
                      </div>
                    </div>

                    {/* Play Button Placeholder */}
                    <div className="flex justify-center py-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <AudioLines className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button 
                      className="w-full"
                      onClick={async () => {
                        if (!podcastSettings.episodeName?.trim()) {
                          toast({
                            title: "Episode name required",
                            description: "Please enter an episode name.",
                            variant: "destructive",
                          });
                          return;
                        }
                        setIsGeneratingPodcast(true);
                        try {
                          await podcastsAPI.generate({
                            template_name: podcastSettings.template,
                            notebook_name: notebook?.name || "Unknown",
                            episode_name: podcastSettings.episodeName,
                            instructions: `Generate a ${podcastSettings.length} podcast episode`,
                            podcast_length: podcastSettings.length,
                          });
                          toast({
                            title: "Podcast generation started",
                            description: "Your podcast is being generated. This may take a few minutes.",
                          });
                          setShowPodcastForm(false);
                          setPodcastSettings({
                            episodeName: "",
                            template: "Deep Dive",
                            length: "Short (5-10 min)",
                            maxChunks: 5,
                            minChunkSize: 3
                          });
                          // Poll for updates - check if new episodes were created
                          const initialCount = podcasts.length;
                          const pollInterval = setInterval(async () => {
                            try {
                              const updatedPodcasts = await podcastsAPI.list(id!);
                              setPodcasts(updatedPodcasts);
                              
                              // If we have more episodes than before, generation is complete
                              if (updatedPodcasts.length > initialCount) {
                                clearInterval(pollInterval);
                                setIsGeneratingPodcast(false);
                                toast({
                                  title: "Podcast generated successfully!",
                                  description: "Your podcast is now available in the Studio panel.",
                                });
                              }
                            } catch (error) {
                              console.error("Error polling for podcasts:", error);
                              clearInterval(pollInterval);
                              setIsGeneratingPodcast(false);
                            }
                          }, 3000);
                          
                          // Set a timeout to stop polling after 5 minutes
                          setTimeout(() => {
                            clearInterval(pollInterval);
                            setIsGeneratingPodcast(false);
                          }, 300000);
                        } catch (error) {
                          toast({
                            title: "Generation failed",
                            description: "Failed to generate podcast.",
                            variant: "destructive",
                          });
                          setIsGeneratingPodcast(false);
                        }
                      }}
                      disabled={isGeneratingPodcast || !podcastSettings.episodeName?.trim()}
                    >
                      {isGeneratingPodcast ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          GENERATING...
                        </>
                      ) : (
                        "GENERATE"
                      )}
                    </Button>

                    {/* Progress indicator */}
                    {isGeneratingPodcast && (
                      <div className="space-y-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                          Generating podcast episode... This may take a few minutes.
                        </p>
                      </div>
                    )}
                  </div>
              </ScrollArea>
            </div>
          ) : isViewingNote && viewingNote ? (
            /* Note Viewer */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsViewingNote(false);
                      setViewingNote(null);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h3 className="font-semibold text-lg">{viewingNote.title}</h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditNote(viewingNote)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <div className="mb-4">
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                    (Saved responses are view only)
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  {isLoadingNoteContent ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-muted-foreground">Loading content...</div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {viewingNote.content || "No content available"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Note Editor */
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold">
                    {expandedNoteId ? "Edit Note" : "New Note"}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={!noteTitle?.trim() || !noteContent?.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsCreatingNote(false);
                        setExpandedNoteId(null);
                        setNoteTitle("");
                        setNoteContent("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-4 space-y-4 flex flex-col">
                  <input
                    type="text"
                    placeholder="Note title..."
                    className="w-full px-3 py-2 rounded-lg border bg-background/50 font-semibold text-sm"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Start writing your note..."
                    className="w-full flex-1 px-3 py-2 rounded-lg border bg-background/50 resize-none text-sm min-h-[400px]"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Notes and Podcasts List - Only show when not in form mode */}
            {!isCreatingNote && !isViewingNote && !showPodcastForm && (
              <ScrollArea className="flex-1">
                <div className="p-4">
            <div className="space-y-4">
                    {/* Recent Notes */}
              {notes.length > 0 ? (
                <div>
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                          className="flex items-start justify-between p-2 border border-gray-200 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition-colors gap-2"
                        onClick={() => handleViewNote(note)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <FileText className="h-4 w-4 text-gray-500" />
                          </div>
                          <span className="text-xs font-medium text-gray-900 break-words leading-tight flex-1 min-w-0">
                            {note.title}
                          </span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="h-6 w-6 text-destructive hover:text-destructive ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No notes yet</p>
                  <p className="text-xs">Create your first note to get started</p>
                </div>
              )}

                    {/* Recent Podcasts */}
              {podcasts.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Generated Podcasts</h3>
                  <div className="space-y-2">
                    {podcasts.map((podcast) => (
                      <Card key={podcast.id} className="p-3 bg-gray-800 border-gray-700">
                        <div className="flex items-center gap-3">
                          {/* Audio Wave Icon */}
                          <div className="flex-shrink-0 relative">
                            <div className="flex items-center space-x-1">
                              <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                              <div className="w-1 h-5 bg-purple-400 rounded-full"></div>
                              <div className="w-1 h-2 bg-purple-400 rounded-full"></div>
                              <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
                              <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                            </div>
                            <div className="absolute -top-1 -right-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full opacity-80"></div>
                            </div>
                          </div>
                          
                          {/* Title and Metadata */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-200 leading-tight break-words truncate">
                              {podcast.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {podcast.duration ? `${Math.round(podcast.duration / 60)}:${String(Math.round(podcast.duration % 60)).padStart(2, '0')}` : 'Unknown'} • {new Date(podcast.created).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 flex-shrink-0 text-purple-400 hover:text-purple-300 hover:bg-gray-700"
                              onClick={() => handlePlayPodcast(podcast)}
                            >
                              {playingPodcast === `"${podcast.id}"` ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 flex-shrink-0 text-purple-400 hover:text-purple-300 hover:bg-gray-700"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem 
                                  className="text-gray-200 hover:bg-gray-700"
                                  onClick={() => {
                                    const audioUrl = `http://localhost:8001${podcast.audio_url}`;
                                    const link = document.createElement('a');
                                    link.href = audioUrl;
                                    link.download = `${podcast.name}.mp3`;
                                    link.click();
                                  }}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-400 hover:bg-gray-700"
                                  onClick={() => {
                                    setPodcastToDelete(podcast);
                                    setShowDeletePodcastModal(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No podcasts yet</p>
                  <p className="text-xs">Generate your first audio overview</p>
                </div>
              )}
            </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Note Viewer Overlay */}
      {isViewingNote && viewingNote && (
        <div className="sm:hidden fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsViewingNote(false);
                    setViewingNote(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="text-sm text-muted-foreground">Studio &gt; Note</div>
                  <h3 className="font-semibold text-lg">{viewingNote.title}</h3>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditNote(viewingNote)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteNote(viewingNote.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <div className="mb-4">
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                  (Saved responses are view only)
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {viewingNote.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Note Editor Overlay */}
      {isCreatingNote && (
        <div className="sm:hidden fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">
                {expandedNoteId ? "Edit Note" : "New Note"}
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveNote}
                  disabled={!noteTitle?.trim() || !noteContent?.trim()}
                >
                  Save
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setIsCreatingNote(false);
                    setExpandedNoteId(null);
                    setNoteTitle("");
                    setNoteContent("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4 flex flex-col">
              <input
                type="text"
                placeholder="Note title..."
                className="w-full px-3 py-2 rounded-lg border bg-background/50 font-semibold backdrop-blur-sm"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <textarea
                placeholder="Start writing your note..."
                className="w-full flex-1 px-3 py-2 rounded-lg border bg-background/50 resize-none backdrop-blur-sm min-h-[400px]"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      
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

      {/* Delete Note Dialog */}
      <Dialog open={showDeleteNoteModal} onOpenChange={setShowDeleteNoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{noteToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteNoteModal(false);
                setNoteToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => noteToDelete && handleDeleteNote(noteToDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Note Dialog */}
      <Dialog open={showRenameNoteModal} onOpenChange={setShowRenameNoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {noteToRename?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="note-title">Note name*</Label>
            <Input
              id="note-title"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Enter new title..."
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameNote();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRenameNoteModal(false);
                setNoteToRename(null);
                setNewNoteTitle("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameNote}
              disabled={!newNoteTitle.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Podcast Confirmation Dialog */}
      <AlertDialog open={showDeletePodcastModal} onOpenChange={setShowDeletePodcastModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Podcast</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{podcastToDelete?.name || 'this podcast'}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePodcast}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}