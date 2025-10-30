import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  FileText,
  Calendar,
  Save,
  X,
  Copy,
  Share,
  ChevronLeft
} from "lucide-react";
import { notesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@/types";
import { cn } from "@/lib/utils";

interface NotesPanelProps {
  notebookId: string;
}

export function NotesPanel({ notebookId }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, [notebookId]);

  useEffect(() => {
    if (selectedNote && !isEditing && !isCreating) {
      setNoteTitle(selectedNote.title);
      setNoteContent(selectedNote.content);
    }
  }, [selectedNote, isEditing, isCreating]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await notesAPI.list(notebookId);
      setNotes(data);
    } catch (error) {
      toast({
        title: "Error loading notes",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both title and content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isCreating) {
        const newNote = await notesAPI.create({
          notebook_id: notebookId,
          title: noteTitle,
          content: noteContent,
        });
        toast({
          title: "Note created",
          description: "Your note has been saved successfully.",
        });
        setSelectedNote(newNote);
        setIsCreating(false);
      } else if (isEditing && selectedNote) {
        const updatedNote = await notesAPI.update(selectedNote.id, {
          title: noteTitle,
          content: noteContent,
        });
        toast({
          title: "Note updated",
          description: "Your changes have been saved.",
        });
        setSelectedNote(updatedNote);
        setIsEditing(false);
      }
      loadNotes();
    } catch (error) {
      toast({
        title: "Error saving note",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesAPI.delete(noteId);
      toast({
        title: "Note deleted",
        description: "The note has been removed from your notebook.",
      });
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setNoteTitle("");
        setNoteContent("");
      }
      loadNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = () => {
    setSelectedNote(null);
    setIsCreating(true);
    setIsEditing(false);
    setNoteTitle("");
    setNoteContent("");
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    if (selectedNote) {
      setNoteTitle(selectedNote.title);
      setNoteContent(selectedNote.content);
    } else {
      setNoteTitle("");
      setNoteContent("");
    }
  };

  const filteredNotes = notes.filter(note =>
    (note.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (note.content?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Notes List - Mobile: Full width, Desktop: Sidebar */}
      <div className={cn(
        "flex flex-col border-b lg:border-b-0 lg:border-r bg-card/50",
        selectedNote || isCreating ? "hidden lg:flex lg:w-80" : "flex w-full lg:w-80"
      )}>
        {/* Header with Search and Add Button */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              size="sm" 
              onClick={handleCreateNew}
              variant="default"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No notes match your search" : "Create your first note to get started"}
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={`cursor-pointer hover:bg-accent/50 transition-colors ${
                      selectedNote?.id === note.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                      setIsCreating(false);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate text-sm">{note.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {note.content}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(note.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Note Editor - Right Side */}
      <div className={cn(
        "bg-muted/10",
        selectedNote || isCreating ? "flex-1" : "hidden lg:flex lg:flex-1"
      )}>
        {selectedNote || isCreating ? (
          <div className="h-full flex flex-col">
            <div className="p-4 sm:p-6 border-b">
              <div className="flex items-start gap-3">
                {/* Mobile back button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedNote(null);
                    setIsCreating(false);
                    setIsEditing(false);
                    setNoteTitle("");
                    setNoteContent("");
                  }}
                  className="lg:hidden shrink-0 mt-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 flex items-center justify-between">
                  {isEditing || isCreating ? (
                    <Input
                      placeholder="Note title..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="text-lg sm:text-xl font-semibold max-w-2xl"
                    />
                  ) : (
                    <h2 className="text-lg sm:text-xl font-semibold">{noteTitle}</h2>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {(isEditing || isCreating) ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSaveNote}
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedNote(null);
                            setNoteTitle("");
                            setNoteContent("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedNote && !isCreating && (
                <div className="flex items-center gap-1 mt-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last updated {new Date(selectedNote.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-6">
              {isEditing || isCreating ? (
                <Textarea
                  placeholder="Start writing your note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full h-full min-h-[400px] resize-none"
                />
              ) : (
                <div className="bg-card rounded-lg p-6 min-h-[400px]">
                  <div className="whitespace-pre-wrap">
                    {noteContent}
                  </div>
                </div>
              )}
            </div>
            
            {!isEditing && !isCreating && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Content
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">Select a note to view or edit</p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}