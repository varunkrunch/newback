import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Link, 
  Youtube, 
  Globe, 
  Mic, 
  MessageSquare,
  Sparkles,
  FileUp,
  Plus,
  Trash2,
  Download
} from "lucide-react";
import { SourcesPanel } from "./SourcesPanel";
import { NotesPanel } from "./NotesPanel";
import { ChatPanel } from "./ChatPanel";
import { PodcastPanel } from "./PodcastPanel";
import type { Notebook } from "@/types";

interface NotebookViewProps {
  notebook: Notebook | null;
}

export function NotebookView({ notebook }: NotebookViewProps) {
  const [activeTab, setActiveTab] = useState("sources");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNoteSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!notebook) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Welcome to NerdNest</h2>
          <p className="text-sm md:text-base text-muted-foreground px-4">
            Select a notebook from the sidebar or create a new one to get started.
            Upload sources, take notes, generate podcasts, and chat with your knowledge base.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">{notebook.name}</h1>
              {notebook.description && (
                <p className="text-sm md:text-base text-muted-foreground mt-1">{notebook.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs md:text-sm">
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs md:text-sm">
                <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Delete</span>
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-2 md:gap-4 mt-4">
            <Badge variant="secondary" className="px-2 py-1 text-xs md:text-sm">
              <FileText className="h-3 w-3 mr-1" />
              12 Sources
            </Badge>
            <Badge variant="secondary" className="px-2 py-1 text-xs md:text-sm">
              <MessageSquare className="h-3 w-3 mr-1" />
              24 Notes
            </Badge>
            <Badge variant="secondary" className="px-2 py-1 text-xs md:text-sm">
              <Mic className="h-3 w-3 mr-1" />
              3 Podcasts
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 md:px-6">
            <TabsList className="h-10 md:h-12 bg-transparent border-b-0 min-w-max">
              <TabsTrigger value="sources" className="data-[state=active]:bg-accent text-xs md:text-sm px-3 md:px-4">
                <FileUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Sources
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-accent text-xs md:text-sm px-3 md:px-4">
                <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-accent text-xs md:text-sm px-3 md:px-4">
                <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="podcasts" className="data-[state=active]:bg-accent text-xs md:text-sm px-3 md:px-4">
                <Mic className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Podcasts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto animate-content-fade-in">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="sources" className="h-full m-0 animate-tab-switch">
            <SourcesPanel notebookId={notebook.id} notebookName={notebook.name} />
          </TabsContent>
          <TabsContent value="notes" className="h-full m-0 animate-tab-switch">
            <NotesPanel notebookId={notebook.id} key={refreshTrigger} />
          </TabsContent>
          <TabsContent value="chat" className="h-full m-0 animate-tab-switch">
            <ChatPanel notebookId={notebook.id} onNoteSaved={handleNoteSaved} />
          </TabsContent>
          <TabsContent value="podcasts" className="h-full m-0 animate-tab-switch">
            <PodcastPanel notebookId={notebook.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}