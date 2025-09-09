import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

interface JobCardProps {
  job: any;
  showFullDescription?: boolean;
}

export function JobCard({ job, showFullDescription = false }: JobCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/jobs/${job.id}/apply`, {
        coverLetter: "I am very interested in this position and believe my skills align well with your requirements.",
      });
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been sent successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/job-seeker/applications'] });
    },
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
        return;
      }
      toast({
        title: "Application Failed",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to apply for jobs.",
        variant: "destructive",
      });
      return;
    }

    if (user.userType !== 'job_seeker') {
      toast({
        title: "Access Denied",
        description: "Only job seekers can apply for positions.",
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate();
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min || !max) return "Salary not specified";
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  const getJobTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'full_time': 'Full-time',
      'part_time': 'Part-time',
      'contract': 'Contract',
      'remote': 'Remote',
    };
    return typeMap[type] || type;
  };

  const getExperienceLevelDisplay = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive',
    };
    return levelMap[level] || level;
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer border border-gray-100"
      whileHover={{ y: -2 }}
      data-testid={`job-card-${job.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            src={job.companyLogo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
            alt="Company logo"
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900 hover:text-talent-primary transition-colors duration-200">
              {job.title}
            </h3>
            <p className="text-gray-600">{job.companyName}</p>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location || 'Location not specified'}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getJobTypeDisplay(job.jobType)}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0V6a2 2 0 00-2 2v3.92l-.879.439a5.001 5.001 0 00-2.121 7.165l-.354.354A1 1 0 006 20.5v.5a1 1 0 001 1h2.025" />
                </svg>
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </p>
            <p className="text-sm text-gray-500">per year</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className={`transition-colors duration-200 ${
              isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
            }`}
            data-testid={`button-like-${job.id}`}
          >
            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 leading-relaxed">
        {showFullDescription ? job.description : `${job.description?.slice(0, 150)}...`}
      </p>
      
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 5).map((skill: string, index: number) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >
              {skill}
            </Badge>
          ))}
          {job.skills.length > 5 && (
            <Badge variant="outline" className="px-3 py-1 text-xs font-medium rounded-full">
              +{job.skills.length - 5} more
            </Badge>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            0 applicants
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {getExperienceLevelDisplay(job.experienceLevel)}
          </span>
          <span className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verified</span>
          </span>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            data-testid={`button-learn-more-${job.id}`}
          >
            Learn More
          </Button>
          <Button
            onClick={handleApply}
            disabled={applyMutation.isPending}
            className="px-6 py-2 bg-talent-primary text-white rounded-lg font-medium hover:bg-talent-secondary transition-colors duration-200 flex items-center space-x-2"
            data-testid={`button-apply-${job.id}`}
          >
            {applyMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Applying...</span>
              </>
            ) : (
              <>
                <span>Apply Now</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
