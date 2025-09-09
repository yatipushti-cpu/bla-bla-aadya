// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/localStorage.ts
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
var LocalStorage = class {
  dataDir;
  dbPath;
  db;
  constructor(dataDir = "./data") {
    this.dataDir = dataDir;
    this.dbPath = path.join(dataDir, "database.json");
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
        const data = await fs.readFile(this.dbPath, "utf-8");
        this.db = JSON.parse(data);
      } catch (error) {
        await this.save();
      }
    } catch (error) {
      console.error("Error initializing local storage:", error);
      throw error;
    }
  }
  async save() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.db, null, 2));
    } catch (error) {
      console.error("Error saving database:", error);
      throw error;
    }
  }
  // User operations
  async getUser(id) {
    return this.db.users.find((user) => user.id === id);
  }
  async getUserByEmail(email) {
    return this.db.users.find((user) => user.email === email);
  }
  async upsertUser(userData) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const existingUser = this.db.users.find((u) => u.id === userData.id || u.email === userData.email);
    if (existingUser) {
      Object.assign(existingUser, {
        ...userData,
        updatedAt: now
      });
      await this.save();
      return existingUser;
    }
    const newUser = {
      id: userData.id || uuidv4(),
      email: userData.email,
      passwordHash: userData.passwordHash || "",
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
  async getJobSeekerProfile(userId) {
    return this.db.jobSeekerProfiles.find((profile) => profile.userId === userId);
  }
  async createJobSeekerProfile(profileData) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newProfile = {
      id: uuidv4(),
      ...profileData,
      createdAt: now,
      updatedAt: now
    };
    this.db.jobSeekerProfiles.push(newProfile);
    await this.save();
    return newProfile;
  }
  async updateJobSeekerProfile(userId, updates) {
    const profileIndex = this.db.jobSeekerProfiles.findIndex((p) => p.userId === userId);
    if (profileIndex === -1) {
      throw new Error("Job seeker profile not found");
    }
    this.db.jobSeekerProfiles[profileIndex] = {
      ...this.db.jobSeekerProfiles[profileIndex],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.save();
    return this.db.jobSeekerProfiles[profileIndex];
  }
  // Company operations
  async getCompanyProfile(userId) {
    return this.db.companyProfiles.find((profile) => profile.userId === userId);
  }
  async createCompanyProfile(profileData) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newProfile = {
      id: uuidv4(),
      ...profileData,
      createdAt: now,
      updatedAt: now
    };
    this.db.companyProfiles.push(newProfile);
    await this.save();
    return newProfile;
  }
  async updateCompanyProfile(userId, updates) {
    const profileIndex = this.db.companyProfiles.findIndex((p) => p.userId === userId);
    if (profileIndex === -1) {
      throw new Error("Company profile not found");
    }
    this.db.companyProfiles[profileIndex] = {
      ...this.db.companyProfiles[profileIndex],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.save();
    return this.db.companyProfiles[profileIndex];
  }
  // Job posting operations
  async createJobPosting(postingData) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newPosting = {
      id: uuidv4(),
      ...postingData,
      createdAt: now,
      updatedAt: now
    };
    this.db.jobPostings.push(newPosting);
    await this.save();
    return newPosting;
  }
  async getJobPostings(filters = {}) {
    let postings = this.db.jobPostings.filter((p) => p.isActive);
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      postings = postings.filter(
        (p) => p.title.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      postings = postings.filter(
        (p) => p.location?.toLowerCase().includes(locationLower)
      );
    }
    if (filters.jobType) {
      postings = postings.filter((p) => p.jobType === filters.jobType);
    }
    if (filters.experienceLevel) {
      postings = postings.filter((p) => p.experienceLevel === filters.experienceLevel);
    }
    return postings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getJobPostingById(id) {
    return this.db.jobPostings.find((posting) => posting.id === id);
  }
  async getJobPostingsByCompany(companyId) {
    return this.db.jobPostings.filter((posting) => posting.companyId === companyId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async updateJobPosting(id, updates) {
    const postingIndex = this.db.jobPostings.findIndex((p) => p.id === id);
    if (postingIndex === -1) {
      throw new Error("Job posting not found");
    }
    this.db.jobPostings[postingIndex] = {
      ...this.db.jobPostings[postingIndex],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.save();
    return this.db.jobPostings[postingIndex];
  }
  // Job application operations
  async createJobApplication(applicationData) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newApplication = {
      id: uuidv4(),
      ...applicationData,
      appliedAt: now,
      updatedAt: now
    };
    this.db.jobApplications.push(newApplication);
    await this.save();
    return newApplication;
  }
  async getJobApplicationsByApplicant(applicantId) {
    return this.db.jobApplications.filter((app2) => app2.applicantId === applicantId).sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }
  async getJobApplicationsByJob(jobId) {
    return this.db.jobApplications.filter((app2) => app2.jobId === jobId).sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }
  async updateJobApplicationStatus(id, status) {
    const appIndex = this.db.jobApplications.findIndex((app2) => app2.id === id);
    if (appIndex === -1) {
      throw new Error("Job application not found");
    }
    this.db.jobApplications[appIndex] = {
      ...this.db.jobApplications[appIndex],
      status,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.save();
    return this.db.jobApplications[appIndex];
  }
  // Message operations
  async createMessage(messageData) {
    const newMessage = {
      id: uuidv4(),
      ...messageData,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.db.messages.push(newMessage);
    await this.save();
    return newMessage;
  }
  async getConversation(userId1, userId2) {
    return this.db.messages.filter(
      (msg) => msg.senderId === userId1 && msg.receiverId === userId2 || msg.senderId === userId2 && msg.receiverId === userId1
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  async getConversations(userId) {
    const userMessages = this.db.messages.filter(
      (msg) => msg.senderId === userId || msg.receiverId === userId
    );
    const conversations = /* @__PURE__ */ new Map();
    userMessages.forEach((msg) => {
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
    return Array.from(conversations.values()).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  }
  async markMessageAsRead(messageId) {
    const messageIndex = this.db.messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex !== -1) {
      this.db.messages[messageIndex].isRead = true;
      await this.save();
    }
  }
  // Session operations
  async createSession(sessionId, userId, data, expiresAt) {
    const session2 = {
      id: sessionId,
      userId,
      data,
      expiresAt: expiresAt.toISOString()
    };
    this.db.sessions.push(session2);
    await this.save();
    return session2;
  }
  async getSession(sessionId) {
    const session2 = this.db.sessions.find((s) => s.id === sessionId);
    if (session2 && new Date(session2.expiresAt) < /* @__PURE__ */ new Date()) {
      await this.deleteSession(sessionId);
      return void 0;
    }
    return session2;
  }
  async deleteSession(sessionId) {
    const index2 = this.db.sessions.findIndex((s) => s.id === sessionId);
    if (index2 !== -1) {
      this.db.sessions.splice(index2, 1);
      await this.save();
    }
  }
  async cleanupExpiredSessions() {
    const now = /* @__PURE__ */ new Date();
    this.db.sessions = this.db.sessions.filter((s) => new Date(s.expiresAt) > now);
    await this.save();
  }
  // User search operations
  async searchUsers(currentUserId, searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    return this.db.users.filter((user) => user.id !== currentUserId).filter(
      (user) => user.email.toLowerCase().includes(searchLower) || user.displayName?.toLowerCase().includes(searchLower) || user.firstName?.toLowerCase().includes(searchLower) || user.lastName?.toLowerCase().includes(searchLower)
    ).map((user) => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      userType: user.userType
    }));
  }
};
var storage = new LocalStorage();

// server/localAuth.ts
import bcrypt from "bcrypt";
import session from "express-session";
import { env } from "process";
var SESSION_SECRET = env.SESSION_SECRET || "your-secret-key-change-this-in-production";
var SESSION_TTL = 7 * 24 * 60 * 60 * 1e3;
function setupLocalAuth(app2) {
  app2.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL,
      sameSite: "lax"
    }
  }));
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.upsertUser({
        email,
        passwordHash,
        firstName,
        lastName,
        displayName: `${firstName || ""} ${lastName || ""}`.trim() || email
      });
      req.session.userId = user.id;
      res.json({
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          userType: user.userType
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          userType: user.userType,
          profileImageUrl: user.profileImageUrl
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      let profile = null;
      if (req.user.userType === "job_seeker") {
        profile = await storage.getJobSeekerProfile(req.user.id);
      } else if (req.user.userType === "employer") {
        profile = await storage.getCompanyProfile(req.user.id);
      }
      res.json({
        ...req.user,
        profile
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/auth/status", (req, res) => {
    res.json({
      authenticated: !!req.session.userId
    });
  });
}
function isAuthenticated(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  storage.getUser(req.session.userId).then((user) => {
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  }).catch((error) => {
    console.error("Authentication middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  });
}
async function cleanupExpiredSessions() {
  try {
    await storage.cleanupExpiredSessions();
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
  }
}
setInterval(cleanupExpiredSessions, 60 * 60 * 1e3);

// shared/schema.ts
import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var userTypeEnum = pgEnum("user_type", ["job_seeker", "employer"]);
var applicationStatusEnum = pgEnum("application_status", ["pending", "under_review", "interview_scheduled", "rejected", "hired"]);
var jobTypeEnum = pgEnum("job_type", ["full_time", "part_time", "contract", "remote"]);
var experienceLevelEnum = pgEnum("experience_level", ["entry", "mid", "senior", "executive"]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: text("display_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: userTypeEnum("user_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var jobSeekerProfiles = pgTable("job_seeker_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title"),
  summary: text("summary"),
  skills: jsonb("skills").$type(),
  experience: text("experience"),
  education: text("education"),
  resumeUrl: varchar("resume_url"),
  portfolioUrl: varchar("portfolio_url"),
  location: varchar("location"),
  salaryExpectation: integer("salary_expectation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var companyProfiles = pgTable("company_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyName: varchar("company_name").notNull(),
  industry: varchar("industry"),
  companySize: varchar("company_size"),
  description: text("description"),
  website: varchar("website"),
  location: varchar("location"),
  logoUrl: varchar("logo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var jobPostings = pgTable("job_postings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companyProfiles.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  location: varchar("location"),
  jobType: jobTypeEnum("job_type").notNull(),
  experienceLevel: experienceLevelEnum("experience_level").notNull(),
  skills: jsonb("skills").$type(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobPostings.id),
  applicantId: varchar("applicant_id").notNull().references(() => jobSeekerProfiles.id),
  status: applicationStatusEnum("status").default("pending"),
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ one, many }) => ({
  jobSeekerProfile: one(jobSeekerProfiles, {
    fields: [users.id],
    references: [jobSeekerProfiles.userId]
  }),
  companyProfile: one(companyProfiles, {
    fields: [users.id],
    references: [companyProfiles.userId]
  }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" })
}));
var jobSeekerProfilesRelations = relations(jobSeekerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [jobSeekerProfiles.userId],
    references: [users.id]
  }),
  applications: many(jobApplications)
}));
var companyProfilesRelations = relations(companyProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [companyProfiles.userId],
    references: [users.id]
  }),
  jobPostings: many(jobPostings)
}));
var jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  company: one(companyProfiles, {
    fields: [jobPostings.companyId],
    references: [companyProfiles.id]
  }),
  applications: many(jobApplications)
}));
var jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  job: one(jobPostings, {
    fields: [jobApplications.jobId],
    references: [jobPostings.id]
  }),
  applicant: one(jobSeekerProfiles, {
    fields: [jobApplications.applicantId],
    references: [jobSeekerProfiles.id]
  })
}));
var messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender"
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver"
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  displayName: z.string().optional()
});
var insertJobSeekerProfileSchema = createInsertSchema(jobSeekerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
async function registerRoutes(app2) {
  setupLocalAuth(app2);
  app2.post("/api/user/select-type", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { userType } = req.body;
      if (!["job_seeker", "employer"].includes(userType)) {
        return res.status(400).json({ message: "Invalid user type" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.upsertUser({ ...user, userType });
      res.json({ success: true, userType });
    } catch (error) {
      console.error("Error selecting user type:", error);
      res.status(500).json({ message: "Failed to select user type" });
    }
  });
  app2.post("/api/user/display-name", isAuthenticated, async (req, res) => {
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
  app2.get("/api/job-seeker/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getJobSeekerProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching job seeker profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  app2.post("/api/job-seeker/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      if (req.body.salaryExpectation && (req.body.salaryExpectation < 0 || req.body.salaryExpectation > 2147483647)) {
        return res.status(400).json({ message: "Salary expectation must be between 0 and 2,147,483,647" });
      }
      const profileData = insertJobSeekerProfileSchema.parse({ ...req.body, userId });
      const existingProfile = await storage.getJobSeekerProfile(userId);
      let profile;
      if (existingProfile) {
        profile = await storage.updateJobSeekerProfile(userId, profileData);
      } else {
        profile = await storage.createJobSeekerProfile(profileData);
      }
      res.json(profile);
    } catch (error) {
      console.error("Error creating/updating job seeker profile:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid data provided",
          details: error.errors
        });
      }
      res.status(500).json({ message: "Failed to save profile" });
    }
  });
  app2.get("/api/company/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getCompanyProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  app2.post("/api/company/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const profileData = insertCompanyProfileSchema.parse({ ...req.body, userId });
      const existingProfile = await storage.getCompanyProfile(userId);
      let profile;
      if (existingProfile) {
        profile = await storage.updateCompanyProfile(userId, profileData);
      } else {
        profile = await storage.createCompanyProfile(profileData);
      }
      res.json(profile);
    } catch (error) {
      console.error("Error creating/updating company profile:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid data provided",
          details: error.errors
        });
      }
      res.status(500).json({ message: "Failed to save profile" });
    }
  });
  app2.get("/api/jobs", async (req, res) => {
    try {
      const filters = {
        search: req.query.search,
        location: req.query.location,
        jobType: req.query.jobType,
        experienceLevel: req.query.experienceLevel
      };
      const jobs = await storage.getJobPostings(filters);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });
  app2.get("/api/jobs/:id", async (req, res) => {
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
  app2.post("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (user?.userType !== "employer") {
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
      const job = await storage.createJobPosting(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating job posting:", error);
      res.status(500).json({ message: "Failed to create job posting" });
    }
  });
  app2.get("/api/company/jobs", isAuthenticated, async (req, res) => {
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
  app2.post("/api/jobs/:jobId/apply", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (user?.userType !== "job_seeker") {
        return res.status(403).json({ message: "Only job seekers can apply for jobs" });
      }
      const jobSeekerProfile = await storage.getJobSeekerProfile(userId);
      if (!jobSeekerProfile) {
        return res.status(400).json({ message: "Job seeker profile required to apply" });
      }
      const applicationData = insertJobApplicationSchema.parse({
        jobId: req.params.jobId,
        applicantId: jobSeekerProfile.id,
        coverLetter: req.body.coverLetter
      });
      const application = await storage.createJobApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error creating job application:", error);
      res.status(500).json({ message: "Failed to apply for job" });
    }
  });
  app2.get("/api/job-seeker/applications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const jobSeekerProfile = await storage.getJobSeekerProfile(userId);
      if (!jobSeekerProfile) {
        return res.status(404).json({ message: "Job seeker profile not found" });
      }
      const applications = await storage.getJobApplicationsByApplicant(jobSeekerProfile.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  app2.get("/api/jobs/:jobId/applications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (user?.userType !== "employer") {
        return res.status(403).json({ message: "Only employers can view applications" });
      }
      const applications = await storage.getJobApplicationsByJob(req.params.jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });
  app2.patch("/api/applications/:id/status", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (user?.userType !== "employer") {
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
  app2.get("/api/messages/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  app2.get("/api/messages/:contactId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const messages2 = await storage.getConversation(userId, req.params.contactId);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId
      });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.get("/api/users/search", isAuthenticated, async (req, res) => {
    try {
      const { q } = req.query;
      const currentUserId = req.user.id;
      if (!q || typeof q !== "string" || q.length < 3) {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/build"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
