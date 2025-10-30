import { useState, useEffect } from "react";
import { Plus, BookOpen, FileText, Mic, Search, Brain, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Notebook } from "@/types";

interface SidebarProps {
  notebooks: Notebook[];
  selectedNotebook: Notebook | null;
  onSelectNotebook: (notebook: Notebook) => void;
  onCreateNotebook: () => void;
  onDeleteNotebook: (id: string) => void;
}

export function Sidebar({
  notebooks,
  selectedNotebook,
  onSelectNotebook,
  onCreateNotebook,
  onDeleteNotebook,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filteredNotebooks, setFilteredNotebooks] = useState(notebooks);
  const navigate = useNavigate();

  useEffect(() => {
    const filtered = notebooks.filter((notebook) =>
      notebook.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotebooks(filtered);
  }, [searchQuery, notebooks]);

  return (
    <div
      className={cn(
        "relative h-screen flex flex-col border-r border-border bg-sidebar-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-black tracking-tight">NerdNest</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* New Notebook Button */}
      <div className="px-4 pb-4">
        <Button
          onClick={() => navigate('/create-notebook')}
          className={cn(
            "w-full justify-start gap-2",
            isCollapsed && "justify-center px-0"
          )}
          variant="default"
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && "New Notebook"}
        </Button>
      </div>

      <Separator />

      {/* Notebooks List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              My Notebooks
            </h3>
          )}
          {filteredNotebooks.map((notebook) => (
            <Button
              key={notebook.id}
              variant={selectedNotebook?.id === notebook.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                isCollapsed && "justify-center px-0"
              )}
              onClick={() => onSelectNotebook(notebook)}
            >
              <BookOpen className="h-4 w-4" />
              {!isCollapsed && (
                <span className="truncate">{notebook.name}</span>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      {!isCollapsed && (
        <>
          <Separator />
          <div className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              All Notes
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Mic className="h-4 w-4" />
              Podcasts
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}