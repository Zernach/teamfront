# Epic 6: Web Frontend Core

**Epic ID:** 6  
**Title:** Web Frontend Core  
**Description:** React setup, routing, state management

## Overview

Set up the foundational web frontend architecture using React Native Web and TypeScript. This includes project initialization, routing, global state management, API client configuration, and core UI infrastructure.

## Technology Stack

- React Native Web 0.19+
- TypeScript 5.0+ (strict mode)
- React Navigation (web routing)
- Zustand or Redux Toolkit (global state)
- React Query (TanStack Query) for server state
- Axios with interceptors (API client)
- Socket.io client (WebSocket)

## Project Setup

### Initialization
- React Native Web project structure
- TypeScript configuration (strict mode)
- Build configuration (Webpack/Metro)
- Development environment setup
- Production build optimization

### Directory Structure
```
src/
├── app/              # Routes/pages
├── components/       # Reusable UI components
├── constants/        # Constants, colors, styles
├── hooks/           # Custom React hooks
├── services/        # API clients, WebSocket
├── store/           # Global state (Zustand/Redux)
├── utils/           # Utility functions
└── types/           # TypeScript types
```

## Routing

### Navigation Setup
- React Navigation configured for web
- Route definitions (Login, Upload, Gallery, etc.)
- Protected routes (require authentication)
- Navigation guards
- Deep linking support

### Routes
- `/` - Home/Landing
- `/login` - Authentication
- `/upload` - Upload interface
- `/gallery` - Photo gallery
- `/photo/:id` - Photo detail view

## State Management

### Global State (Zustand/Redux)
- Auth state: user, tokens, authentication status
- Upload state: queue, progress tracking, statistics
- UI state: modals, loading states, errors

### Server State (React Query)
- Photo queries (list, detail)
- Upload job queries
- Automatic caching and refetching
- Optimistic updates

### State Persistence
- Auth tokens stored securely (localStorage/cookies)
- Upload queue persistence across navigation
- User preferences storage

## API Client Configuration

### Axios Setup
- Base URL configuration
- Request interceptors (add JWT token)
- Response interceptors (handle errors, refresh tokens)
- Error handling middleware
- Request/response logging (dev mode)

### API Service Layer
- Photo API service
- Upload API service
- Auth API service
- Type-safe API calls with TypeScript

## WebSocket Client

### Connection Management
- Socket.io client initialization
- Connection with JWT authentication
- Auto-reconnection logic
- Event listeners for upload progress
- Connection state management

## Error Handling

### Global Error Boundary
- React Error Boundary component
- Error logging and reporting
- User-friendly error display
- Fallback UI for errors

### API Error Handling
- Network error detection
- Server error parsing
- User-friendly error messages
- Retry mechanisms
- Error state management

## Authentication Integration

### Auth Flow
- Login/logout functionality
- Token storage and retrieval
- Token refresh on expiration
- Protected route handling
- Auth state synchronization

## UI Foundation

### Design System Setup
- Color palette constants
- Typography system
- Spacing system
- Component library foundation
- Theme configuration

### Core Components
- Layout components (Container, Flex, etc.)
- Form components (Input, Button, etc.)
- Feedback components (Loading, Error, Toast)
- Navigation components

## Development Tools

### Code Quality
- ESLint configuration
- Prettier configuration
- TypeScript strict mode
- Pre-commit hooks
- Testing setup (Jest, React Testing Library)

### Development Experience
- Hot reload configuration
- Source maps
- Debugging setup
- Environment variables
- Development server

## Acceptance Criteria

- [ ] React Native Web project initialized
- [ ] TypeScript strict mode configured
- [ ] Routing setup with protected routes
- [ ] Global state management configured
- [ ] React Query setup for server state
- [ ] API client with interceptors
- [ ] WebSocket client configured
- [ ] Error boundary implemented
- [ ] Authentication flow integrated
- [ ] Core UI components created
- [ ] Development environment working
- [ ] Build process configured

## Dependencies

- React Native Web
- React Navigation
- Zustand or Redux Toolkit
- React Query (TanStack Query)
- Axios
- Socket.io client

## Related Epics

- Epic 2: Authentication & Authorization (API integration)
- Epic 7: Web Upload UI (builds on core)
- Epic 8: Web Gallery UI (builds on core)

