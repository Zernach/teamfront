# Epic 9: Mobile Frontend Core

**Epic ID:** 9  
**Title:** Mobile Frontend Core  
**Description:** React Native setup, navigation

## Overview

Set up the foundational mobile frontend architecture using React Native and TypeScript. This includes project initialization, navigation setup, state management, API client configuration, and platform-specific infrastructure for iOS and Android.

## Technology Stack

- React Native 0.72+
- TypeScript 5.0+ (strict mode)
- React Navigation (native navigation)
- Zustand or Redux Toolkit (global state)
- React Query (TanStack Query) for server state
- Axios with interceptors (API client)
- AsyncStorage (local persistence)

## Project Setup

### Initialization
- React Native project structure
- TypeScript configuration (strict mode)
- Metro bundler configuration
- iOS and Android project setup
- Development environment setup

### Directory Structure
```
src/
├── app/              # Screens/pages
├── components/       # Reusable UI components
├── constants/        # Constants, colors, styles
├── hooks/           # Custom React hooks
├── services/        # API clients, native modules
├── store/           # Global state (Zustand/Redux)
├── utils/           # Utility functions
├── types/           # TypeScript types
└── native/          # Native module bridges
```

## Navigation

### React Navigation Setup
- Stack navigator configuration
- Tab navigator (if needed)
- Bottom sheet navigation
- Deep linking support
- Navigation guards (auth)

### Screens
- LoginScreen
- UploadScreen
- GalleryScreen
- PhotoDetailScreen
- SettingsScreen (optional)

### Navigation Patterns
- Stack navigation for main flow
- Modal screens for detail views
- Bottom tabs for primary navigation
- Drawer navigation (optional)

## State Management

### Global State (Zustand/Redux)
- Auth state: user, tokens, authentication status
- Upload state: queue, progress tracking, statistics
- UI state: modals, loading states, errors
- Network state: online/offline status

### Server State (React Query)
- Photo queries (list, detail)
- Upload job queries
- Automatic caching and refetching
- Offline support with cache

### Local Persistence
- AsyncStorage for auth tokens
- Upload queue persistence
- User preferences
- Offline queue storage

## API Client Configuration

### Axios Setup
- Base URL configuration
- Request interceptors (add JWT token)
- Response interceptors (handle errors, refresh tokens)
- Network error detection
- Retry logic for failed requests

### Network Status
- NetInfo integration
- Online/offline state tracking
- Queue requests when offline
- Sync when connection restored

## Platform-Specific Setup

### iOS Configuration
- Info.plist permissions
- Photo library access permissions
- Camera permissions
- Background modes configuration
- App Store compliance

### Android Configuration
- AndroidManifest.xml permissions
- Runtime permission handling (Android 6.0+)
- Scoped storage support (Android 10+)
- Background service configuration
- Play Store compliance

## Native Module Integration

### Photo Library Access
- `@react-native-camera-roll/camera-roll` setup
- Permission handling
- Photo selection interface
- HEIC/HEIF format support

### Camera Integration
- `react-native-vision-camera` setup (optional)
- Camera permissions
- Photo capture functionality
- Image format conversion

## Error Handling

### Global Error Handling
- Error boundary component
- Error logging (Sentry or similar)
- User-friendly error display
- Crash reporting

### Network Error Handling
- Network disconnection detection
- Offline queue management
- Retry mechanisms
- Error state display

## Authentication Integration

### Auth Flow
- Login/logout functionality
- Secure token storage (Keychain/Keystore)
- Token refresh on expiration
- Protected screen handling
- Biometric authentication (optional)

## UI Foundation

### Design System
- Color palette constants
- Typography system
- Spacing system
- Component library foundation
- Platform-specific styling (iOS/Android)

### Core Components
- Layout components
- Form components (Input, Button, etc.)
- Feedback components (Loading, Error, Toast)
- Navigation components
- Platform-specific components

## Development Tools

### Code Quality
- ESLint configuration
- Prettier configuration
- TypeScript strict mode
- Pre-commit hooks
- Testing setup (Jest, React Native Testing Library)

### Development Experience
- Fast Refresh configuration
- Debugging setup (React Native Debugger)
- Environment variables
- Development builds
- Simulator/emulator setup

## Performance Optimization

### Bundle Optimization
- Code splitting
- Image optimization
- Lazy loading
- Memory management

### Native Performance
- Native module optimization
- Background task optimization
- Memory leak prevention

## Acceptance Criteria

- [ ] React Native project initialized
- [ ] TypeScript strict mode configured
- [ ] Navigation setup with protected screens
- [ ] Global state management configured
- [ ] React Query setup for server state
- [ ] API client with interceptors
- [ ] Network status monitoring
- [ ] iOS permissions configured
- [ ] Android permissions configured
- [ ] Photo library access setup
- [ ] Error boundary implemented
- [ ] Authentication flow integrated
- [ ] Core UI components created
- [ ] Development environment working
- [ ] Build process configured for iOS and Android

## Dependencies

- React Native
- React Navigation
- Zustand or Redux Toolkit
- React Query (TanStack Query)
- Axios
- AsyncStorage
- NetInfo
- @react-native-camera-roll/camera-roll

## Related Epics

- Epic 2: Authentication & Authorization (API integration)
- Epic 10: Mobile Upload (builds on core)
- Epic 11: Mobile Gallery (builds on core)

