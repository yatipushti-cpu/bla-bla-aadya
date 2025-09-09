
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to access settings",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim());
      setSelectedUserType(user.userType || '');
    }
  }, [user]);

  // Update display name mutation
  const updateDisplayNameMutation = useMutation({
    mutationFn: async (newDisplayName: string) => {
      return await apiRequest('POST', '/api/user/display-name', { displayName: newDisplayName });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Display name updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update display name",
        variant: "destructive",
      });
    },
  });

  // Update user type mutation
  const updateUserTypeMutation = useMutation({
    mutationFn: async (userType: string) => {
      return await apiRequest('POST', '/api/user/select-type', { userType });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User type updated successfully! Please refresh the page to see changes.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Redirect to appropriate dashboard
      setTimeout(() => {
        if (selectedUserType === 'job_seeker') {
          setLocation('/job-finder-dashboard');
        } else if (selectedUserType === 'employer') {
          setLocation('/employer-dashboard');
        }
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user type",
        variant: "destructive",
      });
    },
  });

  const handleDisplayNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      updateDisplayNameMutation.mutate(displayName.trim());
    }
  };

  const handleUserTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserType) {
      updateUserTypeMutation.mutate(selectedUserType);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-talent-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Display Name Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Name</CardTitle>
              <p className="text-sm text-gray-600">
                Set a custom display name that will be shown instead of your Replit account name
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDisplayNameSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your preferred display name"
                    className="max-w-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current Replit name: {user.firstName} {user.lastName}
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={updateDisplayNameMutation.isPending}
                  className="bg-talent-primary hover:bg-talent-secondary"
                >
                  {updateDisplayNameMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Display Name'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User Type Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Type</CardTitle>
              <p className="text-sm text-gray-600">
                Choose whether you want to use EntreNet as a job seeker or employer
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUserTypeSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="userType">Account Type</Label>
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger className="max-w-md">
                      <SelectValue placeholder="Select your account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job_seeker">Job Seeker</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Current type: {user.userType === 'job_seeker' ? 'Job Seeker' : user.userType === 'employer' ? 'Employer' : 'Not set'}
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={updateUserTypeMutation.isPending || !selectedUserType || selectedUserType === user.userType}
                  className="bg-talent-primary hover:bg-talent-secondary"
                >
                  {updateUserTypeMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Account Type'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="text-gray-600">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Replit Name:</span>
                  <span className="text-gray-600">{user.firstName} {user.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">User ID:</span>
                  <span className="text-gray-600 font-mono text-sm">{user.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
