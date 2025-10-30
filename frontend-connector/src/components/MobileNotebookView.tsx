import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { 
  ChevronLeft, Plus, Play, Upload, Link, Type, 
  Sparkles, FileText, Trash2, X, AudioLines 
} from "lucide-react";
import type { Source, Note, Transformation } from "@/types";

interface MobileNotebookViewProps {
  activeTab: string;
  isSourceExpanded: boolean;
  selectedSource: Source | null;
  showAddSourceForm: boolean;
  showDiscoverForm: boolean;
  showPodcastForm: boolean;
  sources: Source[];
  notes: Note[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sourceType: "link" | "upload" | "text";
  setSourceType: (type: "link" | "upload" | "text") => void;
  urlInput: string;
  setUrlInput: (url: string) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  discoverQuery: string;
  setDiscoverQuery: (query: string) => void;
  selectedTransformation: string;
  setSelectedTransformation: (transformation: string) => void;
  transformationResults: Record<string, string>;
  transformations: Transformation[];
  loadingTransformations: boolean;
  handleSourceSelect: (source: Source) => void;
  handleAddSourceClick: () => void;
  handleDiscoverClick: () => void;
  handleCloseSourceView: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUrlSubmit: () => void;
  handleTextSubmit: () => void;
  handleDiscoverSubmit: () => void;
  handleTransformationRun: () => void;
  handleSaveAsNote: (transformation: string, content: string) => void;
  getSourceIcon: (type: string) => string;
  noteTitle: string;
  setNoteTitle: (title: string) => void;
  noteContent: string;
  setNoteContent: (content: string) => void;
  isCreatingNote: boolean;
  setIsCreatingNote: (creating: boolean) => void;
  expandedNoteId: string | null;
  setExpandedNoteId: (id: string | null) => void;
  handleSaveNote: () => void;
  handleDeleteNote: (id: string) => void;
  handleEditNote: (note: Note) => void;
  setShowPodcastForm: (show: boolean) => void;
  podcastSettings: any;
  setPodcastSettings: (settings: any) => void;
  isGeneratingPodcast: boolean;
  ChatPanel: React.ComponentType<any>;
  notebookId: string;
}

export function MobileNotebookView({
  activeTab,
  isSourceExpanded,
  selectedSource,
  showAddSourceForm,
  showDiscoverForm,
  showPodcastForm,
  sources,
  notes,
  searchQuery,
  setSearchQuery,
  sourceType,
  setSourceType,
  urlInput,
  setUrlInput,
  textInput,
  setTextInput,
  discoverQuery,
  setDiscoverQuery,
  selectedTransformation,
  setSelectedTransformation,
  transformationResults,
  handleSourceSelect,
  handleAddSourceClick,
  handleDiscoverClick,
  handleCloseSourceView,
  handleFileUpload,
  handleUrlSubmit,
  handleTextSubmit,
  handleDiscoverSubmit,
  handleTransformationRun,
  handleSaveAsNote,
  getSourceIcon,
  noteTitle,
  setNoteTitle,
  noteContent,
  setNoteContent,
  isCreatingNote,
  setIsCreatingNote,
  expandedNoteId,
  setExpandedNoteId,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  setShowPodcastForm,
  podcastSettings,
  setPodcastSettings,
  isGeneratingPodcast,
  ChatPanel,
  notebookId
}: MobileNotebookViewProps) {
  return (
    <div className="md:hidden h-[calc(100vh-89px)] sm:h-[calc(100vh-107px)] animate-content-fade-in">
      <Tabs value={activeTab} className="h-full">
        {/* Sources Tab */}
        <TabsContent value="sources" className="h-full mt-0 p-0 animate-tab-switch">
          {isSourceExpanded ? (
            <div className="h-full flex flex-col bg-card animate-panel-slide-in">
              {/* Expanded Header */}
              <div className="sticky top-0 z-10 p-3 border-b flex items-center justify-between bg-background/95 backdrop-blur animate-slide-in-top">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCloseSourceView}
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold text-sm truncate">
                    {showAddSourceForm ? "Add a Source" : 
                     showDiscoverForm ? "Discover sources" : 
                     selectedSource?.title || "Source Details"}
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCloseSourceView}
                  className="h-8 w-8 p-0 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  {/* Add Source Form */}
                  {showAddSourceForm && (
                    <div className="space-y-4">
                      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                        {["upload", "link", "text"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setSourceType(type as any)}
                            className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-colors ${
                              sourceType === type
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground"
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>

                      {sourceType === "upload" && (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm font-medium mb-2">Drop files or browse</p>
                          <Input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pdf,.txt,.doc,.docx"
                            className="hidden"
                            id="mobile-file-upload"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => document.getElementById('mobile-file-upload')?.click()}
                          >
                            Choose Files
                          </Button>
                        </div>
                      )}

                      {sourceType === "link" && (
                        <div className="space-y-3">
                          <Label htmlFor="mobile-url" className="text-sm">URL</Label>
                          <Input
                            id="mobile-url"
                            placeholder="Enter URL..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            className="h-10"
                          />
                          <Button 
                            onClick={handleUrlSubmit}
                            className="w-full h-10"
                            disabled={!urlInput.trim()}
                          >
                            <Link className="h-4 w-4 mr-2" />
                            Add URL
                          </Button>
                        </div>
                      )}

                      {sourceType === "text" && (
                        <div className="space-y-3">
                          <Label htmlFor="mobile-text" className="text-sm">Text Content</Label>
                          <Textarea
                            id="mobile-text"
                            placeholder="Enter or paste text..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="min-h-[150px]"
                          />
                          <Button 
                            onClick={handleTextSubmit}
                            className="w-full h-10"
                            disabled={!textInput.trim()}
                          >
                            <Type className="h-4 w-4 mr-2" />
                            Add Text
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discover Form */}
                  {showDiscoverForm && (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Sparkles className="h-7 w-7 text-primary" />
                        </div>
                        <h4 className="text-base font-semibold mb-1">What interests you?</h4>
                      </div>

                      <Textarea
                        placeholder="Describe what you'd like to learn about..."
                        value={discoverQuery}
                        onChange={(e) => setDiscoverQuery(e.target.value)}
                        className="min-h-[100px]"
                      />
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleDiscoverSubmit}
                          className="flex-1 h-10"
                          disabled={!discoverQuery.trim()}
                        >
                          Discover
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setDiscoverQuery("I'm feeling curious")}
                          className="flex-1 h-10"
                        >
                          I'm curious
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Source Content */}
                  {selectedSource && !showAddSourceForm && !showDiscoverForm && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                        <Select value={selectedTransformation} onValueChange={setSelectedTransformation} disabled={loadingTransformations}>
                          <SelectTrigger className="flex-1 h-9">
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
                          className="h-9"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run
                        </Button>
                      </div>

                      {Object.entries(transformationResults).map(([transformation, result]) => (
                        <div key={transformation} className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <details className="group">
                            <summary className="font-semibold text-sm text-primary cursor-pointer list-none flex items-center justify-between">
                              <span>{transformation}</span>
                              <span className="group-open:rotate-180 transition-transform text-xs">▼</span>
                            </summary>
                            <div className="mt-2 pt-2 border-t border-primary/20">
                              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{result}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 h-8 text-xs"
                                onClick={() => handleSaveAsNote(transformation, result)}
                              >
                                Save as Note
                              </Button>
                            </div>
                          </details>
                        </div>
                      ))}

                      <div className="p-4 bg-card rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {selectedSource.content || "Content preview will appear here after running a transformation."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="h-full overflow-y-auto bg-background">
              <div className="p-3 sm:p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-base sm:text-lg font-semibold">Sources</h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleAddSourceClick} className="h-8 px-3">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDiscoverClick} className="h-8 px-3">
                      Discover
                    </Button>
                  </div>
                </div>
                <Input
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
                <div className="space-y-2">
                  {sources.length > 0 ? (
                    sources.map((source, index) => (
                      <Card
                        key={source.id}
                        className={cn(
                          "p-3 cursor-pointer hover:bg-accent/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md",
                          "animate-stagger-in",
                          `animate-stagger-${Math.min(index + 1, 6)}`
                        )}
                        onClick={() => handleSourceSelect(source)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{getSourceIcon(source.source_type)}</span>
                          <p className="font-medium text-sm truncate">{source.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {source.content || "No content available"}
                        </p>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">No sources added yet</p>
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
              </div>
            </div>
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="h-full mt-0 p-0 animate-tab-switch">
          <ChatPanel notebookId={notebookId} />
        </TabsContent>

        {/* Studio Tab */}
        <TabsContent value="studio" className="h-full mt-0 p-0 animate-tab-switch">
          <div className="h-full overflow-y-auto bg-background">
            <div className="p-3 sm:p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold">Studio</h2>
                {!isCreatingNote && !showPodcastForm && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsCreatingNote(true)}
                      className="h-8 px-3 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md active:shadow-sm touch-manipulation touch-target"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Note
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowPodcastForm(true)}
                      className="h-8 px-3 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md active:shadow-sm touch-manipulation touch-target"
                    >
                      <AudioLines className="h-3.5 w-3.5 mr-1" />
                      Podcast
                    </Button>
                  </div>
                )}
              </div>

              {/* Notes List */}
              {!isCreatingNote && !showPodcastForm && (
                <div className="space-y-2">
                  {notes.length > 0 ? (
                    notes.map((note, index) => (
                      <Card
                        key={note.id}
                        className={cn(
                          "p-3 transition-all duration-300 touch-manipulation",
                          "hover:scale-[1.02] hover:shadow-md active:scale-95 active:shadow-sm",
                          "animate-stagger-in",
                          `animate-stagger-${Math.min(index + 1, 6)}`
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="flex-shrink-0 mt-0.5">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">{note.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {note.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                              className="h-7 w-7 p-0"
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-3">No notes yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCreatingNote(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Note
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Note Editor */}
              {isCreatingNote && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">
                      {expandedNoteId ? "Edit Note" : "New Note"}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveNote}
                        disabled={!noteTitle?.trim() || !noteContent?.trim()}
                        className="h-8"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsCreatingNote(false);
                          setExpandedNoteId(null);
                          setNoteTitle("");
                          setNoteContent("");
                        }}
                        className="h-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                  <Input
                    placeholder="Note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="h-10"
                  />
                  <Textarea
                    placeholder="Start writing your note..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="min-h-[300px]"
                  />
                </div>
              )}

              {/* Podcast Generator */}
              {showPodcastForm && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Generate Podcast</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPodcastForm(false)}
                      className="h-8"
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  {/* Simplified podcast form for mobile */}
                  <div className="space-y-3">
                    <Input
                      placeholder="Episode Name"
                      value={podcastSettings.episodeName}
                      onChange={(e) => setPodcastSettings({
                        ...podcastSettings,
                        episodeName: e.target.value
                      })}
                      className="h-10"
                    />
                    
                    <Select 
                      value={podcastSettings.template}
                      onValueChange={(value) => setPodcastSettings({
                        ...podcastSettings,
                        template: value
                      })}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deep Dive - get into it">Deep Dive</SelectItem>
                        <SelectItem value="2 Friends Having Fun">2 Friends</SelectItem>
                        <SelectItem value="Storytelling">Storytelling</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      className="w-full h-10"
                      disabled={isGeneratingPodcast || !podcastSettings.episodeName?.trim()}
                    >
                      {isGeneratingPodcast ? "Generating..." : "Generate Podcast"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}