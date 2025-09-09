import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { StatsCard } from "@/components/stats-card";
import { ApplicationCard } from "@/components/application-card";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function JobSeekerDashboard() {
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

  // Redirect if not job seeker
  useEffect(() => {
    if (user && user.userType !== 'job_seeker') {
      setLocation('/employer-dashboard');
    }
  }, [user, setLocation]);

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/job-seeker/applications'],
    enabled: !!user && user.userType === 'job_seeker',
    retry: false,
    meta: {
      onError: (error: Error) => {
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
        }
      }
    }
  });

  const { data: recommendedJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs'],
    enabled: !!user && user.userType === 'job_seeker',
    retry: false,
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
    applications: applications?.length || 0,
    interviews: applications?.filter((app: any) => app.status === 'interview_scheduled').length || 0,
    views: 47, // Mock data - would come from profile views API
    messages: 8, // Mock data - would come from messages API
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
                Welcome back, <span data-testid="text-username">{user.firstName || 'Job Seeker'}</span>!
              </h1>
              <p className="text-gray-600 mt-2">Track your applications and discover new opportunities</p>
            </div>
            <div className="flex space-x-4">
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
              title="Applications Sent"
              value={stats.applications}
              icon="paper-plane"
              color="blue"
              data-testid="stats-applications"
            />
            <StatsCard
              title="Interviews"
              value={stats.interviews}
              icon="video"
              color="green"
              data-testid="stats-interviews"
            />
            <StatsCard
              title="Profile Views"
              value={stats.views}
              icon="eye"
              color="purple"
              data-testid="stats-views"
            />
            <StatsCard
              title="Messages"
              value={stats.messages}
              icon="envelope"
              color="orange"
              data-testid="stats-messages"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Applications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation('/jobs')}
                  className="text-talent-primary hover:text-talent-secondary font-medium"
                  data-testid="link-view-all-applications"
                >
                  View All
                </Button>
              </div>
              
              {applicationsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 3).map((application: any) => (
                    <ApplicationCard 
                      key={application.id} 
                      application={application}
                      data-testid={`application-card-${application.id}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No applications yet</p>
                  <Button 
                    onClick={() => setLocation('/jobs')}
                    className="bg-talent-primary text-white"
                    data-testid="button-browse-jobs"
                  >
                    Browse Jobs
                  </Button>
                </div>
              )}
            </div>

            {/* Recommended Jobs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended for You</h2>
              
              {jobsLoading ? (
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                          <div>
                            <div className="h-5 bg-gray-300 rounded w-48 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-32"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommendedJobs && recommendedJobs.length > 0 ? (
                <div className="space-y-6">
                  {recommendedJobs.slice(0, 2).map((job: any) => (
                    <JobCard 
                      key={job.id} 
                      job={job}
                      data-testid={`job-card-${job.id}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recommended jobs available</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">85% Complete</span>
                  <span className="text-xs text-gray-500">Almost there!</span>
                </div>
                <Progress value={85} className="w-full" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Add portfolio</span>
                  <Button size="sm" variant="ghost" className="text-talent-primary p-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Get 3 endorsements</span>
                  <span className="text-xs text-gray-400">2/3</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setLocation('/jobs')}
                  data-testid="quick-action-browse-jobs"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Browse Jobs</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  data-testid="quick-action-update-resume"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Update Resume</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setLocation('/messages')}
                  data-testid="quick-action-network"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Network</span>
                </Button>
              </div>
            </div>

            {/* Messages Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation('/messages')}
                  className="text-talent-primary hover:text-talent-secondary text-sm font-medium"
                  data-testid="link-view-all-messages"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60" 
                    alt="HR Manager" 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Jessica Chen</p>
                    <p className="text-xs text-gray-500 truncate">Thanks for applying! We'd like to schedule...</p>
                  </div>
                  <div className="w-2 h-2 bg-talent-primary rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
