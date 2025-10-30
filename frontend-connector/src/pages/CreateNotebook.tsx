import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Brain, BookOpen, ArrowLeft } from "lucide-react";
import { notebookAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function CreateNotebook() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your notebook.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      const notebook = await notebookAPI.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      
      toast({
        title: "Notebook created",
        description: "Your new notebook has been created successfully.",
      });
      
      navigate(`/notebook/${notebook.id}`, { state: { notebook } });
    } catch (error) {
      toast({
        title: "Failed to create notebook",
        description: "An error occurred while creating the notebook.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-6 sm:py-12 px-4 animate-slide-in-bottom">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4 transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notebooks
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-primary/20 hover:shadow-md">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create New Notebook</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Start organizing your sources, notes, and ideas in one place
          </p>
        </div>

        {/* Form */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">
                Notebook Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Machine Learning Research"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 sm:h-11 text-sm sm:text-base"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm sm:text-base">
                Description <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="What is this notebook about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleCreate}
                disabled={isCreating || !name.trim()}
                className="flex-1 order-2 sm:order-1 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create Notebook
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                disabled={isCreating}
                className="order-1 sm:order-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-6 sm:mt-8 p-4 bg-muted/50 rounded-xl">
          <h3 className="font-semibold mb-2 text-sm">Tips for organizing notebooks:</h3>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <li>• Use descriptive names that clearly identify the topic</li>
            <li>• Group related sources and notes in the same notebook</li>
            <li>• Add descriptions to help you remember the notebook's purpose</li>
            <li>• You can always rename or update notebooks later</li>
          </ul>
        </div>
      </div>
    </div>
  );
}