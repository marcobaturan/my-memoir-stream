import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-3">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
            <p className="text-muted-foreground">
              The entry you're looking for seems to have vanished into the digital ether. 
              Perhaps it's time to create a new memory?
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <a href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Journal
              </a>
            </Button>
            <Button asChild variant="outline" onClick={() => window.history.back()}>
              <button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
