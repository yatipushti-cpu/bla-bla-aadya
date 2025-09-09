
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

export default function EditProfile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to edit your profile",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  // Fetch current profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: user?.userType === 'job_seeker' ? ['/api/job-seeker/profile'] : ['/api/company/profile'],
    enabled: !!user && !!user.userType,
    retry: false,
  });

  // Form state for job seeker
  const [jobSeekerForm, setJobSeekerForm] = useState({
    title: '',
    summary: '',
    skills: [] as string[],
    experience: '',
    education: '',
    location: '',
    salaryExpectation: '',
    resumeUrl: '',
    portfolioUrl: '',
  });

  // Form state for company
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    description: '',
    website: '',
    location: '',
  });

  const [skillsInput, setSkillsInput] = useState('');

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      if (user?.userType === 'job_seeker') {
        setJobSeekerForm({
          title: profile.title || '',
          summary: profile.summary || '',
          skills: profile.skills || [],
          experience: profile.experience || '',
          education: profile.education || '',
          location: profile.location || '',
          salaryExpectation: profile.salaryExpectation?.toString() || '',
          resumeUrl: profile.resumeUrl || '',
          portfolioUrl: profile.portfolioUrl || '',
        });
        setSkillsInput((profile.skills || []).join(', '));
      } else if (user?.userType === 'employer') {
        setCompanyForm({
          companyName: profile.companyName || '',
          industry: profile.industry || '',
          companySize: profile.companySize || '',
          description: profile.description || '',
          website: profile.website || '',
          location: profile.location || '',
        });
      }
    }
  }, [profile, user?.userType]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (formData: any) => {
      const endpoint = user?.userType === 'job_seeker' ? '/api/job-seeker/profile' : '/api/company/profile';
      return await apiRequest('POST', endpoint, formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ 
        queryKey: user?.userType === 'job_seeker' ? ['/api/job-seeker/profile'] : ['/api/company/profile'] 
      });
      // Redirect back to dashboard
      setLocation(user?.userType === 'job_seeker' ? '/job-finder-dashboard' : '/employer-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleJobSeekerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
    const salaryValue = jobSeekerForm.salaryExpectation ? parseInt(jobSeekerForm.salaryExpectation) : null;
    
    // Validate salary range
    if (salaryValue && (salaryValue < 0 || salaryValue > 2000000000)) {
      toast({
        title: "Invalid Salary",
        description: "Please enter a salary between 0 and 2,000,000,000",
        variant: "destructive",
      });
      return;
    }
    
    const formData = {
      ...jobSeekerForm,
      skills,
      salaryExpectation: salaryValue,
    };
    saveProfileMutation.mutate(formData);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfileMutation.mutate(companyForm);
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-talent-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Update your profile information</p>
          <p className="text-sm text-blue-600 mt-1">
            Note: Your name and profile picture are managed through your Replit account settings.
          </p>
        </div>

        {user.userType === 'job_seeker' ? (
          <Card>
            <CardHeader>
              <CardTitle>Job Seeker Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJobSeekerSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">Professional Title</Label>
                    <Input
                      id="title"
                      value={jobSeekerForm.title}
                      onChange={(e) => setJobSeekerForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={jobSeekerForm.location}
                      onChange={(e) => setJobSeekerForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={jobSeekerForm.summary}
                    onChange={(e) => setJobSeekerForm(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief description of your professional background and goals"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="JavaScript, React, Node.js, Python (comma-separated)"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Work Experience</Label>
                  <Textarea
                    id="experience"
                    value={jobSeekerForm.experience}
                    onChange={(e) => setJobSeekerForm(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="Describe your work experience"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    value={jobSeekerForm.education}
                    onChange={(e) => setJobSeekerForm(prev => ({ ...prev, education: e.target.value }))}
                    placeholder="Your educational background"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="salary">Expected Salary (Annual)</Label>
                    <Input
                      id="salary"
                      type="number"
                      min="0"
                      max="2000000000"
                      value={jobSeekerForm.salaryExpectation}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 2000000000)) {
                          setJobSeekerForm(prev => ({ ...prev, salaryExpectation: value }));
                        }
                      }}
                      placeholder="e.g. 80000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="resume">Resume URL</Label>
                    <Input
                      id="resume"
                      type="url"
                      value={jobSeekerForm.resumeUrl}
                      onChange={(e) => setJobSeekerForm(prev => ({ ...prev, resumeUrl: e.target.value }))}
                      placeholder="https://example.com/resume.pdf"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="portfolio">Portfolio URL</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    value={jobSeekerForm.portfolioUrl}
                    onChange={(e) => setJobSeekerForm(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    disabled={saveProfileMutation.isPending}
                    className="bg-talent-primary hover:bg-talent-secondary"
                  >
                    {saveProfileMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation('/job-finder-dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyForm.companyName}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="e.g. Entrenet Inc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={companyForm.industry}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g. Technology, Finance, Healthcare"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Input
                      id="companySize"
                      value={companyForm.companySize}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, companySize: e.target.value }))}
                      placeholder="e.g. 1-10, 11-50, 51-200, 200+"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={companyForm.location}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your company, mission, and values"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="website">Company Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.yourcompany.com"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    disabled={saveProfileMutation.isPending}
                    className="bg-talent-primary hover:bg-talent-secondary"
                  >
                    {saveProfileMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation('/employer-dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
