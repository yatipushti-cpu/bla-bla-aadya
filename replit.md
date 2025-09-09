# EntreNet - Job Marketplace Platform

## Overview

EntreNet is a comprehensive job marketplace platform that connects job seekers with employers. The application features dual user types (job seekers and employers) with tailored dashboards, messaging capabilities, and a robust job posting/application system. Built as a full-stack web application using React frontend with Express backend, the platform provides an intuitive interface for both talent discovery and opportunity matching.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Build Tool**: Vite for fast development and optimized production builds
- **Animation**: Framer Motion for smooth UI transitions and interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Authentication**: Custom session-based authentication with bcrypt for password hashing
- **Data Storage**: File-based JSON storage (localStorage) for development/prototyping
- **Database ORM**: Drizzle ORM configured for PostgreSQL (ready for production migration)
- **API Design**: RESTful endpoints with standardized error handling and request/response patterns

### Core Features & Data Models
- **User Management**: Dual user types (job_seeker/employer) with profile customization
- **Job Seeker Profiles**: Skills, experience, education, portfolio links, salary expectations
- **Company Profiles**: Company information, industry, size, branding
- **Job Postings**: Full CRUD operations with filtering, search, and categorization
- **Application System**: Job application tracking with status management
- **Messaging System**: Real-time communication between job seekers and employers
- **Dashboard Analytics**: User-specific metrics and activity tracking

### Authentication & Authorization
- **Session Management**: Express-session with configurable TTL and security options
- **Password Security**: Bcrypt hashing with salt rounds for secure credential storage
- **Access Control**: Route-level protection with user type-based permissions
- **User Type Selection**: Post-registration flow for role assignment

### UI/UX Design System
- **Design Language**: Modern, professional interface with consistent spacing and typography
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Component Library**: Reusable UI components with consistent styling and behavior
- **Theme System**: CSS custom properties for easy theme customization
- **Loading States**: Skeleton screens and progress indicators for better UX

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **TypeScript**: Full TypeScript support for type safety
- **Build Tools**: Vite for development and production builds

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Framer Motion**: Animation library for smooth transitions
- **Shadcn/ui**: Pre-built component library built on Radix primitives

### State Management and Data Fetching
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management with validation

### Backend Infrastructure
- **Express.js**: Web application framework for Node.js
- **Drizzle ORM**: Type-safe ORM for database operations
- **PostgreSQL**: Production database (configured but not yet migrated from JSON storage)

### Authentication and Security
- **bcrypt**: Password hashing and verification
- **express-session**: Session management middleware
- **UUID**: Unique identifier generation for entities

### Development Tools
- **Replit Integration**: Specialized plugins for Replit development environment
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

### Utility Libraries
- **clsx**: Conditional className utility
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation utilities
- **nanoid**: URL-safe unique ID generator