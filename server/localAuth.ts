import * as express from 'express';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './localStorage';
import { env } from 'process';

const SESSION_SECRET = env.SESSION_SECRET || 'your-secret-key-change-this-in-production';
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 1 week

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profileImageUrl?: string;
  userType?: 'job_seeker' | 'employer';
  createdAt: string;
  updatedAt: string;
}

interface AuthenticatedRequest extends express.Request {
  user?: User;
}

export function setupLocalAuth(app: express.Express) {
  // Configure session middleware
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL,
      sameSite: 'lax'
    }
  }));

  // Registration endpoint
  app.post('/api/auth/register', async (req: express.Request, res: express.Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.upsertUser({
        email,
        passwordHash,
        firstName,
        lastName,
        displayName: `${firstName || ''} ${lastName || ''}`.trim() || email
      });

      // Set session
      req.session.userId = user.id;

      res.json({
        message: 'User registered successfully',
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
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to register user' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set session
      req.session.userId = user.id;

      res.json({
        message: 'Login successful',
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
      console.error('Login error:', error);
      res.status(500).json({ message: 'Failed to login' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req: express.Request, res: express.Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Get profile based on user type
      let profile = null;
      if (req.user.userType === 'job_seeker') {
        profile = await storage.getJobSeekerProfile(req.user.id);
      } else if (req.user.userType === 'employer') {
        profile = await storage.getCompanyProfile(req.user.id);
      }

      res.json({
        ...req.user,
        profile
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Check authentication status
  app.get('/api/auth/status', (req: express.Request, res: express.Response) => {
    res.json({
      authenticated: !!req.session.userId
    });
  });
}

// Authentication middleware
export function isAuthenticated(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Load user from storage
  storage.getUser(req.session.userId)
    .then(user => {
      if (!user) {
        req.session.destroy();
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    })
    .catch(error => {
      console.error('Authentication middleware error:', error);
      res.status(500).json({ message: 'Authentication error' });
    });
}

// Cleanup expired sessions periodically
export async function cleanupExpiredSessions() {
  try {
    await storage.cleanupExpiredSessions();
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);