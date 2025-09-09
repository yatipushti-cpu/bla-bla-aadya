import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function EmployerDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Redirect if not employer
  useEffect(() => {
    if (user && user.userType !== 'employer') {
      setLocation('/job-seeker-dashboard');
    }
  }, [user, setLocation]);

  const { data: companyProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/company/profile'],
    retry: false,
    enabled: isAuthenticated && user?.userType === 'employer',
  });

  const { data: companyJobs, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['/api/company/jobs'],
    retry: false,
    enabled: isAuthenticated && user?.userType === 'employer' && !!companyProfile,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-talent-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    activeJobs: companyJobs?.filter((job: any) => job.isActive).length || 0,
    applications: 142, // Mock data - would come from applications API
    interviews: 12, // Mock data - would come from interviews API
    hires: 23, // Mock data - would come from hires API
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, <span data-testid="text-company-name">{user.profile?.companyName || 'Company'}</span>!
              </h1>
              <p className="text-gray-600 mt-2">Manage your job postings and find the perfect candidates</p>
            </div>
            <div className="flex space-x-4">
              <Button 
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                data-testid="button-post-job"
                onClick={() => {
                  if (!companyProfile) {
                    toast({
                      title: "Company Profile Required",
                      description: "Please complete your company profile before posting a job.",
                      variant: "warning",
                    });
                    setLocation('/edit-profile');
                    return;
                  }
                  setLocation('/create-job');
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Post Job</span>
              </Button>
              <Button 
                className="bg-talent-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-talent-secondary transition-colors duration-200 flex items-center space-x-2"
                onClick={() => setLocation('/edit-profile')}
                data-testid="button-edit-profile"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Jobs"
              value={stats.activeJobs}
              icon="briefcase"
              color="blue"
              data-testid="stats-active-jobs"
            />
            <StatsCard
              title="Total Applications"
              value={stats.applications}
              icon="users"
              color="green"
              data-testid="stats-applications"
            />
            <StatsCard
              title="Scheduled Interviews"
              value={stats.interviews}
              icon="calendar"
              color="purple"
              data-testid="stats-interviews"
            />
            <StatsCard
              title="Successful Hires"
              value={stats.hires}
              icon="trophy"
              color="orange"
              data-testid="stats-hires"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Job Postings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Job Postings</h2>
                <Button 
                  variant="ghost"
                  className="text-talent-primary hover:text-talent-secondary font-medium"
                  data-testid="link-manage-all-jobs"
                >
                  Manage All
                </Button>
              </div>

              {jobsLoading || profileLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="h-5 bg-gray-300 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-gray-300 rounded w-32"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : companyJobs && companyJobs.length > 0 ? (
                <div className="space-y-4">
                  {companyJobs.slice(0, 2).map((job: any) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-6" data-testid={`job-posting-${job.id}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.description?.slice(0, 100)}...</p>
                          <p className="text-sm text-gray-500">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-talent-primary">0</p>
                          <p className="text-xs text-gray-500">Applications</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">0</p>
                          <p className="text-xs text-gray-500">Shortlisted</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">0</p>
                          <p className="text-xs text-gray-500">Interviews</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-view-applications-${job.id}`}
                          >
                            View Applications
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            data-testid={`button-edit-job-${job.id}`}
                          >
                            Edit Job
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.salaryMin && job.salaryMax 
                            ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                            : 'Salary not specified'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No job postings yet</p>
                  <Button 
                    className="bg-talent-primary text-white" 
                    data-testid="button-create-first-job"
                    onClick={() => {
                      if (!companyProfile) {
                        toast({
                          title: "Company Profile Required",
                          description: "Please complete your company profile before posting a job.",
                          variant: "warning",
                        });
                        setLocation('/edit-profile');
                        return;
                      }
                      setLocation('/create-job');
                    }}
                  >
                    Create Your First Job Posting
                  </Button>
                </div>
              )}
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Latest Applications</h2>
                <Button 
                  variant="ghost"
                  className="text-talent-primary hover:text-talent-secondary font-medium"
                  data-testid="link-view-all-applications"
                >
                  View All
                </Button>
              </div>

              <div className="text-center py-8">
                <p className="text-gray-500">No applications yet</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Company Profile */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h3>
              <div className="text-center mb-4">
                <img 
                  src={user.profile?.logoUrl || user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile?.companyName || user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`)}&background=3b82f6&color=fff&size=120`} 
                  alt="Company logo" 
                  className="w-20 h-20 rounded-lg mx-auto object-cover mb-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile?.companyName || user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`)}&background=3b82f6&color=fff&size=120`;
                  }}
                />
                <h4 className="font-semibold text-gray-900">{user.profile?.companyName || 'Your Company'}</h4>
                <p className="text-sm text-gray-600">{user.profile?.industry || 'Industry'} • {user.profile?.companySize || 'Size not specified'}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Profile completion</span>
                  <span className="font-medium text-gray-900">92%</span>
                </div>
                <Progress value={92} className="w-full" />
                <Button 
                  variant="ghost" 
                  className="w-full text-center text-talent-primary hover:text-talent-secondary text-sm font-medium mt-4"
                  data-testid="button-complete-profile"
                >
                  Complete Profile
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  data-testid="quick-action-post-job"
                  onClick={() => {
                    if (!companyProfile) {
                      toast({
                        title: "Company Profile Required",
                        description: "Please complete your company profile before posting a job.",
                        variant: "warning",
                      });
                      setLocation('/edit-profile');
                      return;
                    }
                    setLocation('/create-job');
                  }}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Post New Job</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  data-testid="quick-action-search-candidates"
                  onClick={() => setLocation('/candidates')}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Search Candidates</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  data-testid="quick-action-analytics"
                  onClick={() => setLocation('/analytics')}
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Analytics</span>
                </Button>
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h3>
                <Button 
                  variant="ghost"
                  className="text-talent-primary hover:text-talent-secondary text-sm font-medium"
                  data-testid="link-view-all-interviews"
                >
                  View All
                </Button>
              </div>
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No interviews scheduled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}