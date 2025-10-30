import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Plus, 
  Settings, 
  User, 
  Search,
  FileText,
  Mic,
  Video,
  Network,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId?: string;
}

export function MobileSidebar({ isOpen, onOpenChange, notebookId }: MobileSidebarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleNavigation = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  const mainMenuItems = [
    {
      icon: Home,
      label: "Home",
      action: () => handleNavigation("/"),
      description: "Back to notebooks"
    },
    {
      icon: Plus,
      label: "Create Notebook",
      action: () => handleNavigation("/create-notebook"),
      description: "Start a new project"
    }
  ];

  const notebookMenuItems = [
    {
      icon: FileText,
      label: "Notes",
      action: () => {},
      description: "View and edit notes"
    },
    {
      icon: Mic,
      label: "Audio Overview",
      action: () => {},
      description: "Generate audio content"
    },
    {
      icon: Video,
      label: "Video Overview",
      action: () => {},
      description: "Create video summaries"
    },
    {
      icon: Network,
      label: "Mind Map",
      action: () => {},
      description: "Visualize connections"
    },
    {
      icon: BarChart3,
      label: "Reports",
      action: () => {},
      description: "Generate insights"
    }
  ];

  const settingsMenuItems = [
    {
      icon: Settings,
      label: "Settings",
      action: () => handleNavigation("/settings"),
      description: "Configure preferences"
    },
    {
      icon: User,
      label: "Profile",
      action: () => {},
      description: "Manage account"
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">NerdNest</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notebooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Main Menu */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Main
                </h3>
                <div className="space-y-1">
                  {mainMenuItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-3 px-3"
                      onClick={item.action}
                    >
                      <item.icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notebook Tools */}
              {notebookId && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Notebook Tools
                  </h3>
                  <div className="space-y-1">
                    {notebookMenuItems.map((item) => (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className="w-full justify-start gap-3 h-auto py-3 px-3"
                        onClick={item.action}
                      >
                        <item.icon className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Settings
                </h3>
                <div className="space-y-1">
                  {settingsMenuItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-3 px-3"
                      onClick={item.action}
                    >
                      <item.icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              PRO
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}