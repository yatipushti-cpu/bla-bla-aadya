import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserTypeSelection } from "@/components/user-type-selection";
import { EnhancedAuthForms } from "@/components/enhanced-auth-forms"; 
import { ArrowRight, Users, Briefcase, CheckCircle, Star, TrendingUp } from "lucide-react";

export default function Landing() {
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [showAuthForms, setShowAuthForms] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Navigation */}
      <nav className="relative z-50 px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img 
                src="/entrenet-logo.png" 
                alt="EntreNet Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white">EntreNet</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              onClick={() => setShowAuthForms(true)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all duration-300"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Enhanced animated background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, 270, 360],
              x: [0, 60, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100, -20],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="text-white space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Where 
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Talent
              </span>
              <br />Meets
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                {" "}Opportunity
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-slate-300 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join the next generation job platform where ambitious professionals and innovative companies create extraordinary partnerships.
            </motion.p>
            
            {/* Stats */}
            <motion.div 
              className="flex flex-wrap gap-8 text-slate-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm">94% Success Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm">10k+ Active Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">4.9 Rating</span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button 
                onClick={() => setShowAuthForms(true)}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
                data-testid="button-find-jobs"
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Find Amazing Jobs</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button 
                onClick={() => setShowAuthForms(true)}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-slate-900 transition-all duration-300 flex items-center justify-center space-x-3"
                data-testid="button-hire-talent"
              >
                <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Hire Top Talent</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative lg:justify-self-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Main image container */}
            <div className="relative">
              <motion.div 
                className="w-full max-w-lg mx-auto bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Professional team collaboration" 
                  className="rounded-2xl shadow-2xl w-full object-cover" 
                />
              </motion.div>
              
              {/* Floating success card */}
              <motion.div 
                className="absolute -bottom-8 -left-8 bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-2xl shadow-xl text-white"
                initial={{ opacity: 0, y: 20, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: -5 }}
                transition={{ duration: 0.6, delay: 1 }}
                whileHover={{ rotate: 0, scale: 1.05 }}
              >
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-8 h-8" />
                  <div>
                    <div className="text-sm opacity-90">Placement Success</div>
                    <div className="text-2xl font-bold">94%</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating users card */}
              <motion.div 
                className="absolute -top-8 -right-8 bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white"
                initial={{ opacity: 0, y: -20, rotate: 5 }}
                animate={{ opacity: 1, y: 0, rotate: 5 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                whileHover={{ rotate: 0, scale: 1.05 }}
              >
                <div className="flex items-center space-x-4">
                  <Users className="w-8 h-8" />
                  <div>
                    <div className="text-sm opacity-90">Active Users</div>
                    <div className="text-2xl font-bold">10k+</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Authentication Forms */}
      <EnhancedAuthForms 
        isOpen={showAuthForms}
        onClose={() => setShowAuthForms(false)}
      />

      {/* User Type Selection Modal */}
      <UserTypeSelection 
        isOpen={showUserSelection}
        onClose={() => setShowUserSelection(false)}
      />
    </div>
  );
}
