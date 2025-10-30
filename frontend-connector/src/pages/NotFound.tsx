import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" />
          </div>
          <h1 className="text-6xl sm:text-8xl font-bold text-destructive mb-2">404</h1>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/")} 
            className="w-full sm:w-auto"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
          
          <div className="text-xs text-muted-foreground">
            <p>Attempted to access: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
