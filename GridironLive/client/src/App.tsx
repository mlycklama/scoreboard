import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react"; // Added this import
import NotFound from "@/pages/not-found";
import Scoreboard from "@/pages/scoreboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Scoreboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Add this function to send height to parent window
  const sendHeightToParent = () => {
    setTimeout(() => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'resize', height: height }, '*');
    }, 100);
  };

  // Add these useEffect hooks
  useEffect(() => {
    sendHeightToParent(); // Send height on initial load
  }, []);

  useEffect(() => {
    // Send height periodically to catch any data updates
    const timer = setInterval(sendHeightToParent, 2000); // Check every 2 seconds
    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
