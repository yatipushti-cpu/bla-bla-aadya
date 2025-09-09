import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import JobSeekerDashboard from "@/pages/job-seeker-dashboard";
import EmployerDashboard from "@/pages/employer-dashboard";
import JobListings from "@/pages/job-listings";
import Messages from "@/pages/messages";
import EditProfile from "@/pages/edit-profile";
import CreateJob from "@/pages/create-job";
import { UserTypeSelection } from "@/components/user-type-selection";
import { useState, useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);

  // Show user type selection if user is authenticated but has no user type
  useEffect(() => {
    if (isAuthenticated && user && !user.userType) {
      setShowUserTypeSelection(true);
    } else {
      setShowUserTypeSelection(false);
    }
  }, [isAuthenticated, user?.userType]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/login" component={Landing} />
            <Route path="/register" component={Landing} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/job-finder-dashboard" component={JobSeekerDashboard} />
            <Route path="/employer-dashboard" component={EmployerDashboard} />
            <Route path="/jobs" component={JobListings} />
            <Route path="/messages" component={Messages} />
            <Route path="/edit-profile" component={EditProfile} />
            <Route path="/settings" component={Settings} />
            <Route path="/create-job" component={CreateJob} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      {/* Show user type selection for authenticated users without a type */}
      <UserTypeSelection 
        isOpen={showUserTypeSelection}
        onClose={() => setShowUserTypeSelection(false)}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;