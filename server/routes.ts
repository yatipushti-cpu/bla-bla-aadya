// Express type is imported in the next line, so we can remove this duplicate import
import express, { Express } from 'express';
import { createServer, type Server } from "http";
import { storage } from "./localStorage";
import { setupLocalAuth, isAuthenticated } from "./localAuth";
import {
  insertJobSeekerProfileSchema,
  insertCompanyProfileSchema,
  insertJobPostingSchema,
  insertJobApplicationSchema,
  insertMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupLocalAuth(app);

  // Auth routes are now handled by localAuth.ts

  // User type selection
  app.post('/api/user/select-type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { userType } = req.body;

      if (!['job_seeker', 'employer'].includes(userType)) {
        return res.status(400).json({ message: "Invalid user type" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Always update user type (allow changing)
      await storage.upsertUser({ ...user, userType });

      res.json({ success: true, userType });
    } catch (error) {
      console.error("Error selecting user type:", error);
      res.status(500).json({ message: "Failed to select user type" });
    }
  });

  // Update display name
  app.post('/api/user/display-name', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { displayName } = req.body;

      if (!displayName || displayName.trim().length === 0) {
        return res.status(400).json({ message: "Display name is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.upsertUser({ ...user, displayName: displayName.trim() });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating display name:", error);
      res.status(500).json({ message: "Failed to update display name" });
    }
  });

  // Job Seeker Profile routes
  app.get('/api/job-seeker/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getJobSeekerProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching job seeker profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/job-seeker/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      // Validate salary expectation before schema validation
      if (req.body.salaryExpectation && (req.body.salaryExpectation < 0 || req.body.salaryExpectation > 2147483647)) {
        return res.status(400).json({ message: "Salary expectation must be between 0 and 2,147,483,647" });
      }

      const profileData = insertJobSeekerProfileSchema.parse({ ...req.body, userId });

      const existingProfile = await storage.getJobSeekerProfile(userId);

      let profile;
      if (existingProfile) {
        profile = await storage.updateJobSeekerProfile(userId, {
          title: profileData.title ?? undefined,
          summary: profileData.summary ?? undefined,
          skills: profileData.skills ?? undefined,
          experience: profileData.experience ?? undefined,
          education: profileData.education ?? undefined,
          resumeUrl: profileData.resumeUrl ?? undefined,
          portfolioUrl: profileData.portfolioUrl ?? undefined,
          location: profileData.location ?? undefined,
          salaryExpectation: profileData.salaryExpectation ?? undefined
        });
      } else {
        profile = await storage.createJobSeekerProfile({
          userId: profileData.userId,
          title: profileData.title ?? undefined,
          summary: profileData.summary ?? undefined,
          skills: profileData.skills ?? undefined,
          experience: profileData.experience ?? undefined,
          education: profileData.education ?? undefined,
          resumeUrl: profileData.resumeUrl ?? undefined,
          portfolioUrl: profileData.portfolioUrl ?? undefined,
          location: profileData.location ?? undefined,
          salaryExpectation: profileData.salaryExpectation ?? undefined
        });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error creating/updating job seeker profile:", error);
      if ((error as any).name === 'ZodError') {
        return res.status(400).json({
          message: "Invalid data provided",
          details: (error as { errors: unknown }).errors
        });
      }
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  // Company Profile routes
  app.get('/api/company/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getCompanyProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/company/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = insertCompanyProfileSchema.parse({ ...req.body, userId });

      const existingProfile = await storage.getCompanyProfile(userId);

      let profile;
      if (existingProfile) {
        profile = await storage.updateCompanyProfile(userId, {
          companyName: profileData.companyName,
          location: profileData.location || undefined,
          industry: profileData.industry || undefined, 
          companySize: profileData.companySize || undefined,
          description: profileData.description || undefined,
          website: profileData.website || undefined,
          logoUrl: profileData.logoUrl || undefined
        });
      } else {
        profile = await storage.createCompanyProfile({
          userId: profileData.userId,
          companyName: profileData.companyName,
          location: profileData.location || undefined,
          industry: profileData.industry || undefined,
          companySize: profileData.companySize || undefined,
          description: profileData.description || undefined,
          website: profileData.website || undefined,
          logoUrl: profileData.logoUrl || undefined
        });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error creating/updating company profile:", error);
      if ((error as any).name === 'ZodError') {
        return res.status(400).json({
          message: "Invalid data provided",
          details: (error as { errors: unknown }).errors
        });
      }
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  // Job Posting routes
  app.get('/api/jobs', async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        location: req.query.location as string,
        jobType: req.query.jobType as string,
        experienceLevel: req.query.experienceLevel as string,
      };

      const jobs = await storage.getJobPostings(filters);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/company/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (user?.userType !== 'employer') {
        return res.status(403).json({ message: "Only employers can view company jobs" });
      }

      const companyProfile = await storage.getCompanyProfile(userId);
      if (!companyProfile) {
        return res.status(404).json({ message: "Company profile not found" });
      }

      const jobs = await storage.getJobPostingsByCompany(companyProfile.id);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching company jobs:", error);
      res.status(500).json({ message: "Failed to fetch company jobs" });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const job = await storage.getJobPostingById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (user?.userType !== 'employer') {
        return res.status(403).json({ message: "Only employers can post jobs" });
      }

      const companyProfile = await storage.getCompanyProfile(userId);
      if (!companyProfile) {
        return res.status(400).json({ message: "Company profile required to post jobs" });
      }

      const jobData = insertJobPostingSchema.parse({
        ...req.body,
        companyId: companyProfile.id
      });

      const job = await storage.createJobPosting({
        ...jobData,
        location: jobData.location || undefined,
        requirements: jobData.requirements || undefined,
        salaryMin: jobData.salaryMin || undefined,
        salaryMax: jobData.salaryMax || undefined,
        description: jobData.description,
        title: jobData.title,
        jobType: jobData.jobType,
        experienceLevel: jobData.experienceLevel,
        companyId: jobData.companyId,
        skills: jobData.skills || undefined,
        isActive: true // Explicitly set isActive to true for new job postings
      });
      res.json(job);
    } catch (error) {
      console.error("Error creating job posting:", error);
      res.status(500).json({ message: "Failed to create job posting" });
    }
  });

  app.get('/api/company/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const companyProfile = await storage.getCompanyProfile(userId);

      if (!companyProfile) {
        return res.status(404).json({ message: "Company profile not found" });
      }

      const jobs = await storage.getJobPostingsByCompany(companyProfile.id);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching company jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Job Application routes
  app.post('/api/jobs/:jobId/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (user?.userType !== 'job_seeker') {
        return res.status(403).json({ message: "Only job seekers can apply for jobs" });
      }

      const jobSeekerProfile = await storage.getJobSeekerProfile(userId);
      if (!jobSeekerProfile) {
        return res.status(400).json({ message: "Job seeker profile required to apply" });
      }

      const applicationData = insertJobApplicationSchema.parse({
        jobId: req.params.jobId,
        applicantId: jobSeekerProfile.id,
        coverLetter: req.body.coverLetter,
      });

      const application = await storage.createJobApplication({
        jobId: applicationData.jobId,
        applicantId: applicationData.applicantId,
        coverLetter: applicationData.coverLetter || undefined,
        status: "pending" // Set default status for new applications
      });
      res.json(application);
    } catch (error) {
      console.error("Error creating job application:", error);
      res.status(500).json({ message: "Failed to apply for job" });
    }
  });

  app.get('/api/job-seeker/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user || user.userType !== 'job_seeker') {
        return res.status(403).json({ message: "Only job seekers can view applications" });
      }

      const applications = await storage.getJobApplicationsByApplicant(userId);
      
      // Enrich applications with job details
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const job = await storage.getJobPostingById(app.jobId);
          const company = job ? await storage.getCompanyProfileByCompanyId(job.companyId) : null;
          return {
            ...app,
            job: job ? {
              ...job,
              company: company ? {
                companyName: company.companyName,
                logoUrl: company.logoUrl
              } : null
            } : null
          };
        })
      );

      res.json(enrichedApplications);
    } catch (error) {
      console.error("Error fetching job seeker applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/jobs/:jobId/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (user?.userType !== 'employer') {
        return res.status(403).json({ message: "Only employers can view applications" });
      }

      const applications = await storage.getJobApplicationsByJob(req.params.jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch('/api/applications/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (user?.userType !== 'employer') {
        return res.status(403).json({ message: "Only employers can update application status" });
      }

      const { status } = req.body;
      const application = await storage.updateJobApplicationStatus(req.params.id, status);
      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Message routes
  app.get('/api/messages/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:contactId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messages = await storage.getConversation(userId, req.params.contactId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });

      const message = await storage.createMessage({
        ...messageData,
        isRead: false // Ensure isRead is always a boolean
      });
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Search users
  app.get("/api/users/search", isAuthenticated, async (req, res) => {
    try {
      const { q } = req.query;
      const currentUserId = (req as any).user.id;

      if (!q || typeof q !== 'string' || q.length < 3) {
        return res.json([]);
      }

      const searchTerm = `%${q.toLowerCase()}%`;

      const searchResults = await storage.searchUsers(currentUserId, searchTerm);

      res.json(searchResults);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User search and messaging routes
  app.get('/api/users/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const users = await storage.searchUsers(userId, q);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getConversations(userId);
      
      // Enrich conversations with user details
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherUser = await storage.getUser(conv.userId);
          return {
            ...conv,
            user: otherUser ? {
              id: otherUser.id,
              email: otherUser.email,
              displayName: otherUser.displayName,
              firstName: otherUser.firstName,
              lastName: otherUser.lastName,
              profileImageUrl: otherUser.profileImageUrl,
              userType: otherUser.userType
            } : null
          };
        })
      );

      res.json(enrichedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const otherUserId = req.params.userId;
      
      if (currentUserId === otherUserId) {
        return res.status(400).json({ message: "Cannot message yourself" });
      }

      const messages = await storage.getConversation(currentUserId, otherUserId);
      
      // Enrich messages with sender details
      const enrichedMessages = await Promise.all(
        messages.map(async (msg) => {
          const sender = await storage.getUser(msg.senderId);
          return {
            ...msg,
            sender: sender ? {
              id: sender.id,
              email: sender.email,
              displayName: sender.displayName,
              firstName: sender.firstName,
              lastName: sender.lastName,
              profileImageUrl: sender.profileImageUrl
            } : null
          };
        })
      );

      res.json(enrichedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.id;
      const { receiverId, content } = req.body;

      if (!receiverId || !content) {
        return res.status(400).json({ message: "Receiver ID and content are required" });
      }

      if (senderId === receiverId) {
        return res.status(400).json({ message: "Cannot message yourself" });
      }

      const receiver = await storage.getUser(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }

      const message = await storage.createMessage({
        senderId,
        receiverId,
        content,
        isRead: false
      });

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}