import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Scoreboard from "@/pages/scoreboard";
import { useEffect } from 'react';

// Add this function inside your component (before the return statement)
const sendHeightToParent = () => {
  setTimeout(() => {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: 'resize', height: height }, '*');
  }, 100);
};

// Add these useEffect hooks
useEffect(() => {
  sendHeightToParent();
}, []); // Runs on component mount

// If you have game data state, add this too:
useEffect(() => {
  sendHeightToParent();
}, [/* your games data variable */]); // Replace with your actual state variable

function Router() {
  return (
    <Switch>
      <Route path="/" component={Scoreboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
