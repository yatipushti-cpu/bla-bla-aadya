import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface UserTypeSelectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserTypeSelection({ isOpen, onClose }: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const selectUserTypeMutation = useMutation({
    mutationFn: async (userType: string) => {
      return await apiRequest('POST', '/api/user/select-type', { userType });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User type selected successfully!",
      });
      onClose();
      // Add a delay before redirect to prevent conflicts
      setTimeout(() => {
        if (selectedType === 'job_seeker') {
          setLocation('/job-finder-dashboard');
        } else if (selectedType === 'employer') {
          setLocation('/employer-dashboard');
        }
      }, 500);
    },
    onError: (error: Error) => {
      // If unauthorized, redirect to login with user type stored
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        localStorage.setItem('pendingUserType', selectedType || '');
        window.location.href = '/login';
        return;
      }
      toast({
        title: "Error",
        description: "Failed to select user type. Please try logging out and back in.",
        variant: "destructive",
      });
      console.error("Error selecting user type:", error);
    },
  });

  const handleUserTypeSelect = (userType: string) => {
    setSelectedType(userType);
    selectUserTypeMutation.mutate(userType);
  };

  const handleLogin = () => {
    // For now, just close the modal and let the user access the Get Started button
    // In a more complex flow, this could trigger the auth modal
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="user-type-selection-modal"
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Path</h2>
              <p className="text-gray-600">Select the option that best describes your needs</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Job Seeker Option */}
              <motion.div 
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={() => handleUserTypeSelect('job_seeker')}
                data-testid="select-job-seeker"
              >
                <div className="absolute top-4 right-4">
                  <svg className="w-8 h-8 text-talent-primary opacity-20 group-hover:opacity-40 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Job Seeker</h3>
                <p className="text-gray-600 mb-6">Find your dream job, showcase your skills, and connect with top employers.</p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">Create professional profile</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">Browse thousands of jobs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">Direct messaging with employers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">Application tracking</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-talent-primary text-white py-3 rounded-xl font-semibold hover:bg-talent-secondary transition-colors duration-200"
                  disabled={selectUserTypeMutation.isPending}
                >
                  {selectUserTypeMutation.isPending && selectedType === 'job_seeker' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Setting up...</span>
                    </div>
                  ) : (
                    'Continue as Job Seeker'
                  )}
                </Button>
              </motion.div>
              
              {/* Employer Option */}
              <motion.div 
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 p-8 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={() => handleUserTypeSelect('employer')}
                data-testid="select-employer"
              >
                <div className="absolute top-4 right-4">
                  <svg className="w-8 h-8 text-purple-600 opacity-20 group-hover:opacity-40 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5m14 0H7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Employer</h3>
                <p className="text-gray-600 mb-6">Post jobs, find the perfect candidates, and grow your team with top talent.</p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">Create company profile</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">Post unlimited jobs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">Advanced candidate filtering</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">Applicant management system</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200"
                  disabled={selectUserTypeMutation.isPending}
                >
                  {selectUserTypeMutation.isPending && selectedType === 'employer' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Setting up...</span>
                    </div>
                  ) : (
                    'Continue as Employer'
                  )}
                </Button>
              </motion.div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 mb-4">
                Don't have an account yet?
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="px-6 py-2"
                  data-testid="button-login-modal"
                >
                  Sign In / Sign Up
                </Button>
                <Button 
                  variant="ghost"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  data-testid="button-close-modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
