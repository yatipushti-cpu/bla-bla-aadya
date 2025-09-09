import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LogOut, User, Menu, X, MessageSquare, Settings } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavigationProps {
  onGetStarted?: () => void;
}

export function Navigation({ onGetStarted }: NavigationProps) {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Clear any local storage and reload the page
        localStorage.clear();
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout anyway
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const navItems = [
    { name: "Find Jobs", path: "/jobs", icon: "search" },
    { name: "Messages", path: "/messages", icon: "message" },
  ];

  if (isAuthenticated && user?.userType === 'employer') {
    navItems[0] = { name: "Job Postings", path: "/employer-dashboard", icon: "briefcase" };
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <motion.div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => setLocation('/')}
                whileHover={{ scale: 1.02 }}
                data-testid="logo-entrenet"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src="/entrenet-logo.png"
                    alt="EntreNet Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EntreNet
                </h1>
              </motion.div>
            </div>

            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  {navItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      onClick={() => setLocation(item.path)}
                      className={`text-gray-700 hover:text-talent-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium ${
                        location === item.path ? 'text-talent-primary bg-blue-50' : ''
                      }`}
                      data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 mr-4 border-r border-gray-200 pr-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`)}&background=3b82f6&color=fff`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`)}&background=3b82f6&color=fff`;
                        }}
                      />
                    </div>
                    <span className="font-medium text-sm max-w-32 truncate">
                      {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation(user?.userType === 'job_seeker' ? '/job-finder-dashboard' : '/employer-dashboard')}
                    className="text-gray-700 hover:text-talent-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                    data-testid="nav-dashboard"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/edit-profile')}
                    className="flex items-center space-x-2 px-3 py-2 text-sm whitespace-nowrap"
                  >
                    <User className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/settings')}
                    className="flex items-center space-x-2 px-3 py-2 text-sm whitespace-nowrap"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-talent-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                    data-testid="button-logout"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleLogin}
                    className="text-gray-700 hover:text-talent-primary transition-colors duration-200 px-4 py-2 rounded-md text-sm font-medium"
                    data-testid="button-sign-in"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={onGetStarted || handleLogin}
                    className="bg-gradient-to-r from-talent-primary to-talent-accent text-white px-6 py-2 rounded-lg text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    data-testid="button-get-started"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-talent-primary"
              data-testid="button-mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden bg-white border-t border-gray-200"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    onClick={() => {
                      setLocation(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-700 hover:text-talent-primary hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.name}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation(user?.userType === 'job_seeker' ? '/job-finder-dashboard' : '/employer-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-700 hover:text-talent-primary hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/edit-profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-left text-gray-700 hover:text-talent-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span>Edit Profile</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/settings');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-left text-gray-700 hover:text-talent-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-700 hover:text-talent-primary hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-gray-700 hover:text-talent-primary hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    onGetStarted ? onGetStarted() : handleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-talent-primary to-talent-accent text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}