import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImageUrl?: string;
  userType?: 'job_seeker' | 'employer';
  createdAt: string;
  updatedAt: string;
}

interface JobSeekerProfile {
  id: string;
  userId: string;
  title?: string;
  summary?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  location?: string;
  salaryExpectation?: number;
  createdAt: string;
  updatedAt: string;
}

interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  description?: string;
  website?: string;
  location?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'remote';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  status: 'pending' | 'under_review' | 'interview_scheduled' | 'rejected' | 'hired';
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Session {
  id: string;
  userId: string;
  data: any;
  expiresAt: string;
}

interface Database {
  users: User[];
  jobSeekerProfiles: JobSeekerProfile[];
  companyProfiles: CompanyProfile[];
  jobPostings: JobPosting[];
  jobApplications: JobApplication[];
  messages: Message[];
  sessions: Session[];
}

export class LocalStorage {
  private dataDir: string;
  private dbPath: string;
  private db: Database;

  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.dbPath = path.join(dataDir, 'database.json');
    this.db = {
      users: [],
      jobSeekerProfiles: [],
      companyProfiles: [],
      jobPostings: [],
      jobApplications: [],
      messages: [],
      sessions: []
    };
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      try {
        const data = await fs.readFile(this.dbPath, 'utf-8');
        this.db = JSON.parse(data);
      } catch (error) {
        // File doesn't exist, create with empty structure
        await this.save();
      }
    } catch (error) {
      console.error('Error initializing local storage:', error);
      throw error;
    }
  }

  private async save() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.db, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
      throw error;
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.db.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.db.users.find(user => user.email === email);
  }

  async upsertUser(userData: Partial<User> & { email: string }): Promise<User> {
    const now = new Date().toISOString();
    const existingUser = this.db.users.find(u => u.id === userData.id || u.email === userData.email);
    
    if (existingUser) {
      Object.assign(existingUser, {
        ...userData,
        updatedAt: now
      });
      await this.save();
      return existingUser;
    }

    const newUser: User = {
      id: userData.id || uuidv4(),
      email: userData.email,
      passwordHash: userData.passwordHash || '',
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: userData.displayName,
      profileImageUrl: userData.profileImageUrl,
      userType: userData.userType,
      createdAt: now,
      updatedAt: now
    };

    this.db.users.push(newUser);
    await this.save();
    return newUser;
  }

  // Job Seeker operations
  async getJobSeekerProfile(userId: string): Promise<JobSeekerProfile | undefined> {
    return this.db.jobSeekerProfiles.find(profile => profile.userId === userId);
  }

  async createJobSeekerProfile(profileData: Omit<JobSeekerProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobSeekerProfile> {
    const now = new Date().toISOString();
    const newProfile: JobSeekerProfile = {
      id: uuidv4(),
      ...profileData,
      createdAt: now,
      updatedAt: now
    };

    this.db.jobSeekerProfiles.push(newProfile);
    await this.save();
    return newProfile;
  }

  async updateJobSeekerProfile(userId: string, updates: Partial<Omit<JobSeekerProfile, 'id' | 'userId' | 'createdAt'>>): Promise<JobSeekerProfile> {
    const profileIndex = this.db.jobSeekerProfiles.findIndex(p => p.userId === userId);
    if (profileIndex === -1) {
      throw new Error('Job seeker profile not found');
    }

    this.db.jobSeekerProfiles[profileIndex] = {
      ...this.db.jobSeekerProfiles[profileIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.save();
    return this.db.jobSeekerProfiles[profileIndex];
  }

  // Company operations
  async getCompanyProfile(userId: string): Promise<CompanyProfile | undefined> {
    return this.db.companyProfiles.find(profile => profile.userId === userId);
  }

  async getCompanyProfileByCompanyId(companyId: string): Promise<CompanyProfile | undefined> {
    return this.db.companyProfiles.find(profile => profile.id === companyId);
  }

  async createCompanyProfile(profileData: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyProfile> {
    const now = new Date().toISOString();
    const newProfile: CompanyProfile = {
      id: uuidv4(),
      ...profileData,
      createdAt: now,
      updatedAt: now
    };

    this.db.companyProfiles.push(newProfile);
    await this.save();
    return newProfile;
  }

  async updateCompanyProfile(userId: string, updates: Partial<Omit<CompanyProfile, 'id' | 'userId' | 'createdAt'>>): Promise<CompanyProfile> {
    const profileIndex = this.db.companyProfiles.findIndex(p => p.userId === userId);
    if (profileIndex === -1) {
      throw new Error('Company profile not found');
    }

    this.db.companyProfiles[profileIndex] = {
      ...this.db.companyProfiles[profileIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.save();
    return this.db.companyProfiles[profileIndex];
  }

  // Job posting operations
  async createJobPosting(postingData: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobPosting> {
    const now = new Date().toISOString();
    const newPosting: JobPosting = {
      id: uuidv4(),
      ...postingData,
      createdAt: now,
      updatedAt: now
    };

    this.db.jobPostings.push(newPosting);
    await this.save();
    return newPosting;
  }

  async getJobPostings(filters: any = {}): Promise<JobPosting[]> {
    let postings = this.db.jobPostings.filter(p => p.isActive);

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      postings = postings.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      postings = postings.filter(p => 
        p.location?.toLowerCase().includes(locationLower)
      );
    }

    if (filters.jobType) {
      postings = postings.filter(p => p.jobType === filters.jobType);
    }

    if (filters.experienceLevel) {
      postings = postings.filter(p => p.experienceLevel === filters.experienceLevel);
    }

    return postings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getJobPostingById(id: string): Promise<JobPosting | undefined> {
    return this.db.jobPostings.find(posting => posting.id === id);
  }

  async getJobPostingsByCompany(companyId: string): Promise<JobPosting[]> {
    return this.db.jobPostings
      .filter(posting => posting.companyId === companyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateJobPosting(id: string, updates: Partial<Omit<JobPosting, 'id' | 'createdAt'>>): Promise<JobPosting> {
    const postingIndex = this.db.jobPostings.findIndex(p => p.id === id);
    if (postingIndex === -1) {
      throw new Error('Job posting not found');
    }

    this.db.jobPostings[postingIndex] = {
      ...this.db.jobPostings[postingIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.save();
    return this.db.jobPostings[postingIndex];
  }

  // Job application operations
  async createJobApplication(applicationData: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt'>): Promise<JobApplication> {
    const now = new Date().toISOString();
    const newApplication: JobApplication = {
      id: uuidv4(),
      ...applicationData,
      appliedAt: now,
      updatedAt: now
    };

    this.db.jobApplications.push(newApplication);
    await this.save();
    return newApplication;
  }

  async getJobApplicationsByApplicant(applicantId: string): Promise<JobApplication[]> {
    return this.db.jobApplications
      .filter(app => app.applicantId === applicantId)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  async getJobApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    return this.db.jobApplications
      .filter(app => app.jobId === jobId)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<JobApplication> {
    const appIndex = this.db.jobApplications.findIndex(app => app.id === id);
    if (appIndex === -1) {
      throw new Error('Job application not found');
    }

    this.db.jobApplications[appIndex] = {
      ...this.db.jobApplications[appIndex],
      status: status as JobApplication['status'],
      updatedAt: new Date().toISOString()
    };

    await this.save();
    return this.db.jobApplications[appIndex];
  }

  // Message operations
  async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const newMessage: Message = {
      id: uuidv4(),
      ...messageData,
      createdAt: new Date().toISOString()
    };

    this.db.messages.push(newMessage);
    await this.save();
    return newMessage;
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return this.db.messages
      .filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getConversations(userId: string): Promise<any[]> {
    const userMessages = this.db.messages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );

    const conversations = new Map<string, any>();
    
    userMessages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          userId: otherUserId,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      const conv = conversations.get(otherUserId);
      if (msg.receiverId === userId && !msg.isRead) {
        conv.unreadCount++;
      }
      
      if (new Date(msg.createdAt) > new Date(conv.lastMessage.createdAt)) {
        conv.lastMessage = msg;
      }
    });

    return Array.from(conversations.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const messageIndex = this.db.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      this.db.messages[messageIndex].isRead = true;
      await this.save();
    }
  }

  // Session operations
  async createSession(sessionId: string, userId: string, data: any, expiresAt: Date): Promise<Session> {
    const session: Session = {
      id: sessionId,
      userId,
      data,
      expiresAt: expiresAt.toISOString()
    };

    this.db.sessions.push(session);
    await this.save();
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const session = this.db.sessions.find(s => s.id === sessionId);
    if (session && new Date(session.expiresAt) < new Date()) {
      // Session expired
      await this.deleteSession(sessionId);
      return undefined;
    }
    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const index = this.db.sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      this.db.sessions.splice(index, 1);
      await this.save();
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    this.db.sessions = this.db.sessions.filter(s => new Date(s.expiresAt) > now);
    await this.save();
  }

  // User search operations
  async searchUsers(currentUserId: string, searchTerm: string): Promise<any[]> {
    const searchLower = searchTerm.toLowerCase();
    return this.db.users
      .filter(user => user.id !== currentUserId)
      .filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower)
      )
      .map(user => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        userType: user.userType
      }));
  }
}

export const storage = new LocalStorage();