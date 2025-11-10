# SmartScheduler - Frontend Requirements Document

**Version:** 1.0
**Date:** 2025-11-08
**Technology Stack:** React Native + TypeScript
**Target Platforms:** Web (primary), iOS (future), Android (future)
**Related Documents:** PRD-Master.md, PRD-Backend.md

---

## Table of Contents
1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Screen Specifications](#5-screen-specifications)
6. [Component Library](#6-component-library)
7. [State Management](#7-state-management)
8. [Real-Time Communication](#8-real-time-communication)
9. [API Integration](#9-api-integration)
10. [Routing & Navigation](#10-routing--navigation)
11. [Forms & Validation](#11-forms--validation)
12. [Error Handling](#12-error-handling)
13. [Performance Requirements](#13-performance-requirements)
14. [Accessibility Requirements](#14-accessibility-requirements)
15. [Testing Requirements](#15-testing-requirements)

---

## 1. Overview

### 1.1 Purpose
The SmartScheduler frontend is a React Native + TypeScript application that provides an intuitive interface for dispatchers to manage contractors, view jobs, and leverage intelligent contractor recommendations for job assignments.

### 1.2 Primary Users
- **Dispatchers**: Primary users who assign contractors to jobs
- **Operations Managers**: Secondary users who monitor system performance
- **Administrators**: System configuration and user management

### 1.3 Key User Journeys
1. Dispatcher views open jobs → Requests recommendations → Reviews ranked contractors → Assigns contractor
2. Dispatcher manages contractor profiles → Updates availability → Views contractor schedules
3. Dispatcher monitors real-time assignment updates → Receives notifications → Takes action

---

## 2. Technology Stack

### 2.1 Core Technologies
```json
{
  "framework": "React Native (Web focus)",
  "language": "TypeScript 5.x",
  "buildTool": "Metro / Webpack",
  "packageManager": "Yarn or npm"
}
```

### 2.2 Required Libraries

**UI Framework & Components**
```json
{
  "uiLibrary": "React Native Paper OR Native Base",
  "icons": "@expo/vector-icons OR react-native-vector-icons",
  "datePicker": "@react-native-community/datetimepicker",
  "maps": "react-native-maps (with Google Maps)",
  "charts": "victory-native OR react-native-chart-kit"
}
```

**State Management**
```json
{
  "globalState": "Redux Toolkit OR Zustand",
  "serverState": "@tanstack/react-query (TanStack Query)",
  "formState": "react-hook-form",
  "validation": "zod OR yup"
}
```

**API & Real-Time Communication**
```json
{
  "httpClient": "axios",
  "realTime": "@microsoft/signalr",
  "websocket": "Built into SignalR"
}
```

**Routing & Navigation**
```json
{
  "routing": "@react-navigation/native",
  "stackNavigator": "@react-navigation/stack",
  "tabNavigator": "@react-navigation/bottom-tabs"
}
```

**Development & Testing**
```json
{
  "testing": "Jest + React Native Testing Library",
  "e2e": "Detox OR Cypress (web)",
  "linting": "ESLint + Prettier",
  "typeChecking": "TypeScript strict mode"
}
```

**Utilities**
```json
{
  "dateTime": "date-fns OR dayjs",
  "formatting": "numeral (for numbers), libphonenumber-js (for phones)",
  "logger": "winston OR custom logger"
}
```

---

## 3. Application Architecture

### 3.1 Folder Structure
```
src/
├── api/
│   ├── client.ts                    # Axios instance configuration
│   ├── signalr.ts                   # SignalR hub connection
│   └── endpoints/
│       ├── contractors.ts           # Contractor API calls
│       ├── jobs.ts                  # Job API calls
│       └── assignments.ts           # Assignment API calls
├── components/
│   ├── common/                      # Reusable components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Loading/
│   │   └── ErrorBoundary/
│   ├── features/                    # Feature-specific components
│   │   ├── contractors/
│   │   │   ├── ContractorCard.tsx
│   │   │   ├── ContractorList.tsx
│   │   │   ├── ContractorForm.tsx
│   │   │   └── ContractorFilters.tsx
│   │   ├── jobs/
│   │   │   ├── JobCard.tsx
│   │   │   ├── JobList.tsx
│   │   │   ├── JobForm.tsx
│   │   │   └── JobDetailsModal.tsx
│   │   └── recommendations/
│   │       ├── RecommendationCard.tsx
│   │       ├── RecommendationList.tsx
│   │       ├── ScoreBreakdown.tsx
│   │       └── TimeSlotPicker.tsx
│   └── layouts/
│       ├── MainLayout.tsx           # Main app layout
│       ├── AuthLayout.tsx           # Login/auth layout
│       └── ErrorLayout.tsx          # Error pages layout
├── screens/
│   ├── Dashboard/
│   │   └── DashboardScreen.tsx
│   ├── Jobs/
│   │   ├── JobListScreen.tsx
│   │   ├── JobDetailsScreen.tsx
│   │   └── CreateJobScreen.tsx
│   ├── Contractors/
│   │   ├── ContractorListScreen.tsx
│   │   ├── ContractorDetailsScreen.tsx
│   │   ├── CreateContractorScreen.tsx
│   │   └── EditContractorScreen.tsx
│   ├── Recommendations/
│   │   └── RecommendationsScreen.tsx
│   └── Auth/
│       └── LoginScreen.tsx
├── hooks/
│   ├── useContractors.ts            # Contractor data hooks
│   ├── useJobs.ts                   # Job data hooks
│   ├── useRecommendations.ts        # Recommendation hooks
│   ├── useSignalR.ts                # Real-time connection hook
│   └── useDebounce.ts               # Utility hooks
├── store/
│   ├── index.ts                     # Store configuration
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── uiSlice.ts
│   │   └── notificationSlice.ts
│   └── middleware/
│       └── signalrMiddleware.ts
├── types/
│   ├── contractor.types.ts
│   ├── job.types.ts
│   ├── assignment.types.ts
│   ├── recommendation.types.ts
│   └── api.types.ts
├── utils/
│   ├── formatters.ts                # Date, currency, phone formatters
│   ├── validators.ts                # Custom validation functions
│   ├── constants.ts                 # App constants
│   └── helpers.ts                   # Utility functions
├── config/
│   ├── env.ts                       # Environment configuration
│   └── theme.ts                     # Theme configuration
├── navigation/
│   ├── AppNavigator.tsx             # Main navigation
│   ├── AuthNavigator.tsx            # Auth flow navigation
│   └── types.ts                     # Navigation types
└── App.tsx                          # Root component
```

### 3.2 Design Patterns

**Container/Presenter Pattern**
- Screen components (containers) handle data fetching and business logic
- Presentational components handle UI rendering only
- Clear separation of concerns

**Custom Hooks Pattern**
- Encapsulate reusable logic in custom hooks
- API calls wrapped in react-query hooks
- SignalR connection management in useSignalR hook

**Error Boundary Pattern**
- Top-level error boundary catches unhandled errors
- Feature-specific error boundaries for isolated failures
- Graceful degradation and user-friendly error messages

---

## 4. User Roles & Permissions

### 4.1 Role Definitions

**Dispatcher (Primary User)**
```typescript
interface DispatcherPermissions {
  contractors: {
    view: true,
    create: true,
    update: true,
    delete: false  // Can deactivate only
  },
  jobs: {
    view: true,
    create: true,
    update: true,
    delete: false,
    assign: true
  },
  recommendations: {
    view: true,
    request: true
  },
  reports: {
    view: false
  }
}
```

**Operations Manager**
```typescript
interface ManagerPermissions {
  contractors: {
    view: true,
    create: false,
    update: false,
    delete: false
  },
  jobs: {
    view: true,
    create: false,
    update: false,
    delete: false,
    assign: false
  },
  recommendations: {
    view: true,
    request: true
  },
  reports: {
    view: true
  }
}
```

**Administrator**
```typescript
interface AdminPermissions {
  contractors: { view: true, create: true, update: true, delete: true },
  jobs: { view: true, create: true, update: true, delete: true, assign: true },
  recommendations: { view: true, request: true },
  reports: { view: true },
  system: { configure: true, manageUsers: true }
}
```

---

## 5. Screen Specifications

### 5.1 Dashboard Screen

**Route**: `/dashboard`
**Role Access**: All authenticated users
**Purpose**: Overview of system status and quick actions

#### Layout
```
┌─────────────────────────────────────────────────┐
│  [Logo]  SmartScheduler    [Notifications] [User]│
├─────────────────────────────────────────────────┤
│                                                  │
│  Dashboard                                       │
│                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌────────────┐│
│  │   Open      │ │  Assigned   │ │ Completed  ││
│  │   Jobs      │ │    Today    │ │   Today    ││
│  │    24       │ │     18      │ │     12     ││
│  └─────────────┘ └─────────────┘ └────────────┘│
│                                                  │
│  Quick Actions                                   │
│  [Create New Job]  [View All Contractors]       │
│                                                  │
│  Recent Activity                                 │
│  ┌─────────────────────────────────────────────┐│
│  │ 🟢 Job #1234 assigned to John Smith         ││
│  │    2 minutes ago                            ││
│  │                                             ││
│  │ 🟡 New job created: 123 Main St            ││
│  │    5 minutes ago                            ││
│  │                                             ││
│  │ 🟢 Contractor Sarah Jones completed job    ││
│  │    15 minutes ago                           ││
│  └─────────────────────────────────────────────┘│
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Components
- **StatsCard**: Displays key metrics (Open Jobs, Assigned Today, etc.)
- **QuickActionButtons**: CTA buttons for common actions
- **ActivityFeed**: Real-time activity stream powered by SignalR
- **NotificationBadge**: Shows unread notification count

#### Data Requirements
```typescript
interface DashboardData {
  stats: {
    openJobs: number;
    assignedToday: number;
    completedToday: number;
    activeContractors: number;
  };
  recentActivity: Activity[];
  upcomingJobs: Job[];
}

interface Activity {
  id: string;
  type: 'JobAssigned' | 'JobCreated' | 'JobCompleted' | 'ContractorUpdated';
  message: string;
  timestamp: Date;
  severity: 'info' | 'success' | 'warning' | 'error';
}
```

#### API Calls
- `GET /api/dashboard/stats` - Fetch dashboard statistics
- `GET /api/dashboard/activity?limit=20` - Fetch recent activity
- SignalR: Subscribe to real-time activity updates

#### Functional Requirements
- **FR-FE-001**: Dashboard shall refresh stats every 30 seconds
- **FR-FE-002**: Real-time activity updates shall appear without page refresh
- **FR-FE-003**: Quick action buttons shall navigate to respective screens
- **FR-FE-004**: Stats cards shall display loading skeleton while fetching
- **FR-FE-005**: Activity feed shall auto-scroll to show new items

---

### 5.2 Job List Screen

**Route**: `/jobs`
**Role Access**: All authenticated users
**Purpose**: View and manage all jobs

#### Layout
```
┌─────────────────────────────────────────────────┐
│  Jobs                          [+ Create Job]   │
├─────────────────────────────────────────────────┤
│                                                  │
│  Filters:                                        │
│  [Status ▼] [Type ▼] [Date Range] [Search...]  │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ Job #1234                        [Open]     ││
│  │ Flooring Installation                       ││
│  │ 📍 123 Main St, Austin, TX                  ││
│  │ 📅 Nov 10, 2025 @ 9:00 AM                   ││
│  │                                             ││
│  │ [View Details] [Get Recommendations]       ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ Job #1235                    [Assigned]     ││
│  │ Tile Installation                           ││
│  │ 📍 456 Oak Ave, Austin, TX                  ││
│  │ 📅 Nov 11, 2025 @ 10:00 AM                  ││
│  │ 👤 Assigned to: John Smith                  ││
│  │                                             ││
│  │ [View Details] [View Contractor]           ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  [Load More]                                     │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Components
- **JobCard**: Individual job display with key information
- **JobFilters**: Multi-select filters for status, type, date
- **SearchBar**: Debounced search by job ID, address, or contractor
- **Pagination**: Load more or infinite scroll

#### Data Requirements
```typescript
interface Job {
  id: string;
  jobNumber: string;
  type: JobType;
  status: JobStatus;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  };
  desiredDate: Date;
  duration: number; // minutes
  assignedContractor?: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

enum JobStatus {
  Open = 'Open',
  Assigned = 'Assigned',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

enum JobType {
  Flooring = 'Flooring',
  Tile = 'Tile',
  Carpet = 'Carpet'
}
```

#### API Calls
```typescript
// GET /api/jobs
interface GetJobsParams {
  page: number;
  pageSize: number;
  status?: JobStatus[];
  type?: JobType[];
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface GetJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### Functional Requirements
- **FR-FE-010**: Job list shall support filtering by status, type, and date range
- **FR-FE-011**: Search shall be debounced by 300ms to reduce API calls
- **FR-FE-012**: Pagination shall load 20 jobs per page
- **FR-FE-013**: Job cards shall show status with color coding (Open=blue, Assigned=green, etc.)
- **FR-FE-014**: "Get Recommendations" button only visible for Open jobs
- **FR-FE-015**: Real-time updates when job status changes via SignalR

---

### 5.3 Contractor Recommendation Screen

**Route**: `/jobs/:jobId/recommendations`
**Role Access**: Dispatcher, Manager, Admin
**Purpose**: View ranked contractors and assign to job

#### Layout
```
┌─────────────────────────────────────────────────┐
│  ← Back to Jobs                                  │
├─────────────────────────────────────────────────┤
│  Recommendations for Job #1234                   │
│  Flooring Installation • 123 Main St, Austin    │
│  Desired Date: Nov 10, 2025 @ 9:00 AM           │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ #1 John Smith                Score: 0.92    ││
│  │ ⭐ 4.8 • 📍 2.3 miles                        ││
│  │                                             ││
│  │ Score Breakdown:                            ││
│  │ Availability: 0.95 (same day)               ││
│  │ Rating: 0.96 (4.8/5.0)                      ││
│  │ Distance: 0.85 (2.3 mi)                     ││
│  │                                             ││
│  │ Available Time Slots:                       ││
│  │ • 9:00 AM - 1:00 PM                         ││
│  │ • 2:00 PM - 6:00 PM                         ││
│  │                                             ││
│  │ [Assign to This Contractor]                ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ #2 Sarah Johnson            Score: 0.87    ││
│  │ ⭐ 4.9 • 📍 5.1 miles                        ││
│  │                                             ││
│  │ Score Breakdown:                            ││
│  │ Availability: 0.85 (next day)               ││
│  │ Rating: 0.98 (4.9/5.0)                      ││
│  │ Distance: 0.72 (5.1 mi)                     ││
│  │                                             ││
│  │ Available Time Slots:                       ││
│  │ • 8:00 AM - 12:00 PM                        ││
│  │ • 1:00 PM - 5:00 PM                         ││
│  │                                             ││
│  │ [Assign to This Contractor]                ││
│  └─────────────────────────────────────────────┘│
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Components
- **RecommendationCard**: Ranked contractor with score details
- **ScoreBreakdownChart**: Visual representation of score components
- **TimeSlotPicker**: Selectable available time slots
- **AssignmentConfirmationModal**: Confirm assignment before submission

#### Data Requirements
```typescript
interface RecommendationResponse {
  jobId: string;
  jobDetails: {
    type: JobType;
    location: Location;
    desiredDate: Date;
    duration: number;
  };
  recommendations: RankedContractor[];
  generatedAt: Date;
}

interface RankedContractor {
  contractor: {
    id: string;
    name: string;
    type: ContractorType;
    rating: number;
    baseLocation: Location;
  };
  score: number;
  scoreBreakdown: {
    availability: number;
    rating: number;
    distance: number;
  };
  availableTimeSlots: TimeSlot[];
  distanceFromJob: number; // miles
  estimatedTravelTime: number; // minutes
  aiExplanation?: string; // Optional AI-generated explanation
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
}
```

#### API Calls
```typescript
// GET /api/recommendations
interface GetRecommendationsParams {
  jobId: string;
  maxResults?: number; // default 10
}

// POST /api/assignments
interface CreateAssignmentRequest {
  jobId: string;
  contractorId: string;
  scheduledTimeSlot: TimeSlot;
}
```

#### Functional Requirements
- **FR-FE-020**: Recommendations shall be sorted by score (descending)
- **FR-FE-021**: Score breakdown shall display as horizontal bars (0-100%)
- **FR-FE-022**: Time slots shall be selectable with radio buttons
- **FR-FE-023**: Assignment confirmation modal shall show job + contractor details
- **FR-FE-024**: Loading state shall show skeleton cards while fetching
- **FR-FE-025**: Error state shall allow retry if API call fails
- **FR-FE-026**: Success message shall appear after assignment with auto-redirect
- **FR-FE-027**: AI explanation (if available) shall be expandable/collapsible
- **FR-FE-028**: Distance shall be formatted to 1 decimal place
- **FR-FE-029**: Rating shall display as stars + numeric value

---

### 5.4 Contractor List Screen

**Route**: `/contractors`
**Role Access**: Dispatcher, Admin
**Purpose**: View and manage contractors

#### Layout
```
┌─────────────────────────────────────────────────┐
│  Contractors                [+ Add Contractor]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  Filters:                                        │
│  [Type ▼] [Rating ▼] [Status ▼] [Search...]    │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ John Smith                    ⭐ 4.8        ││
│  │ Flooring Specialist          [Active]       ││
│  │ 📍 Austin, TX                                ││
│  │ 📅 Available: Mon-Fri 8AM-5PM                ││
│  │                                             ││
│  │ [View Details] [Edit] [View Schedule]      ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ Sarah Johnson                 ⭐ 4.9        ││
│  │ Tile & Carpet Specialist     [Active]       ││
│  │ 📍 Round Rock, TX                            ││
│  │ 📅 Available: Mon-Sat 7AM-6PM                ││
│  │                                             ││
│  │ [View Details] [Edit] [View Schedule]      ││
│  └─────────────────────────────────────────────┘│
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Data Requirements
```typescript
interface Contractor {
  id: string;
  name: string;
  type: ContractorType;
  rating: number;
  baseLocation: {
    address: string;
    city: string;
    state: string;
    coordinates: { lat: number; lng: number };
  };
  workingHours: WorkingHours[];
  status: ContractorStatus;
  phone: string;
  email: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

enum ContractorType {
  Flooring = 'Flooring',
  Tile = 'Tile',
  Carpet = 'Carpet',
  Multi = 'Multi' // Multiple specialties
}

enum ContractorStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  OnLeave = 'OnLeave'
}

interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "08:00"
  endTime: string; // "17:00"
}
```

#### Functional Requirements
- **FR-FE-030**: Contractor list shall support filtering by type, rating, and status
- **FR-FE-031**: Search shall filter by name, city, or skills
- **FR-FE-032**: Rating shall display as stars with numeric value
- **FR-FE-033**: Status badge shall be color-coded (Active=green, Inactive=gray, OnLeave=orange)
- **FR-FE-034**: Edit button only visible to users with update permission
- **FR-FE-035**: Pagination shall load 20 contractors per page

---

### 5.5 Create/Edit Contractor Screen

**Route**: `/contractors/new` or `/contractors/:id/edit`
**Role Access**: Dispatcher, Admin
**Purpose**: Create new or edit existing contractor

#### Layout
```
┌─────────────────────────────────────────────────┐
│  ← Back to Contractors                           │
├─────────────────────────────────────────────────┤
│  Create New Contractor                           │
│                                                  │
│  Basic Information                               │
│  ┌─────────────────────────────────────────────┐│
│  │ Name *                                      ││
│  │ [________________]                          ││
│  │                                             ││
│  │ Type *                                      ││
│  │ [Flooring ▼]                                ││
│  │                                             ││
│  │ Phone *                                     ││
│  │ [________________]                          ││
│  │                                             ││
│  │ Email *                                     ││
│  │ [________________]                          ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  Location                                        │
│  ┌─────────────────────────────────────────────┐│
│  │ Address *                                   ││
│  │ [________________]                          ││
│  │                                             ││
│  │ City *           State *      Zip *        ││
│  │ [_________]      [TX ▼]      [_____]       ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  Working Hours                                   │
│  ┌─────────────────────────────────────────────┐│
│  │ ☑ Monday      8:00 AM ▼  -  5:00 PM ▼      ││
│  │ ☑ Tuesday     8:00 AM ▼  -  5:00 PM ▼      ││
│  │ ☑ Wednesday   8:00 AM ▼  -  5:00 PM ▼      ││
│  │ ☑ Thursday    8:00 AM ▼  -  5:00 PM ▼      ││
│  │ ☑ Friday      8:00 AM ▼  -  5:00 PM ▼      ││
│  │ ☐ Saturday    [disabled]                    ││
│  │ ☐ Sunday      [disabled]                    ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  [Cancel]                     [Save Contractor] │
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Form Validation
```typescript
interface ContractorFormData {
  name: string; // Required, min 2 chars, max 100 chars
  type: ContractorType; // Required
  phone: string; // Required, valid US phone format
  email: string; // Required, valid email format
  address: string; // Required
  city: string; // Required
  state: string; // Required, 2-letter state code
  zipCode: string; // Required, 5-digit zip
  workingHours: WorkingHours[]; // At least one day required
}

// Validation Schema (Zod example)
const contractorSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.nativeEnum(ContractorType),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/),
  email: z.string().email(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}$/),
  workingHours: z.array(workingHoursSchema).min(1)
});
```

#### Functional Requirements
- **FR-FE-040**: All required fields shall be validated on blur and submit
- **FR-FE-041**: Phone number shall auto-format as user types: (XXX) XXX-XXXX
- **FR-FE-042**: Address autocomplete shall use Google Places API
- **FR-FE-043**: Working hours shall default to Mon-Fri 8AM-5PM for new contractors
- **FR-FE-044**: Save button shall be disabled while validation errors exist
- **FR-FE-045**: Success message shall appear after save with option to add another
- **FR-FE-046**: Cancel button shall confirm if form has unsaved changes
- **FR-FE-047**: Form shall show loading spinner during submission
- **FR-FE-048**: Validation errors shall display inline below each field

---

### 5.6 Contractor Details Screen

**Route**: `/contractors/:id`
**Role Access**: All authenticated users
**Purpose**: View detailed contractor information and schedule

#### Layout
```
┌─────────────────────────────────────────────────┐
│  ← Back to Contractors          [Edit]          │
├─────────────────────────────────────────────────┤
│                                                  │
│  John Smith                     ⭐ 4.8 (24 jobs)│
│  Flooring Specialist            [Active]        │
│                                                  │
│  Contact Information                             │
│  📞 (512) 555-1234                              │
│  📧 john.smith@example.com                      │
│  📍 123 Contractor Ln, Austin, TX 78701         │
│                                                  │
│  Working Hours                                   │
│  Monday - Friday: 8:00 AM - 5:00 PM             │
│  Saturday - Sunday: Not Available               │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ Upcoming Schedule                           ││
│  │                                             ││
│  │ Nov 10  9:00 AM - 1:00 PM   Job #1234      ││
│  │         Flooring • 123 Main St              ││
│  │                                             ││
│  │ Nov 11  10:00 AM - 2:00 PM  Job #1235      ││
│  │         Tile • 456 Oak Ave                  ││
│  │                                             ││
│  │ Nov 12  Available                           ││
│  │                                             ││
│  │ [View Full Calendar]                        ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  Recent Performance                              │
│  ┌─────────────────────────────────────────────┐│
│  │ Job #1220 - Completed Nov 5 - ⭐ 5.0       ││
│  │ Job #1215 - Completed Nov 3 - ⭐ 4.5       ││
│  │ Job #1210 - Completed Nov 1 - ⭐ 5.0       ││
│  └─────────────────────────────────────────────┘│
│                                                  │
└─────────────────────────────────────────────────┘
```

#### Functional Requirements
- **FR-FE-050**: Details screen shall fetch contractor info and schedule
- **FR-FE-051**: Upcoming schedule shall show next 7 days
- **FR-FE-052**: Available days shall be clearly marked
- **FR-FE-053**: Recent performance shall show last 5 completed jobs
- **FR-FE-054**: Rating shall show aggregate (4.8) and count (24 jobs)
- **FR-FE-055**: Edit button only visible to users with update permission

---

## 6. Component Library

### 6.1 Common Components

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onPress: () => void;
  children: React.ReactNode;
}

// Usage
<Button variant="primary" size="md" loading={isSubmitting}>
  Save Contractor
</Button>
```

#### Input Component
```typescript
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'tel' | 'number';
  maxLength?: number;
}

// Usage
<Input
  label="Contractor Name"
  value={name}
  onChange={setName}
  error={errors.name}
  required
/>
```

#### Card Component
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  onPress?: () => void;
}

// Usage
<Card
  title="John Smith"
  subtitle="Flooring Specialist"
  actions={<Button variant="ghost">Edit</Button>}
>
  <Text>Card content here</Text>
</Card>
```

#### Modal Component
```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

// Usage
<Modal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Assignment"
  actions={
    <>
      <Button variant="ghost" onPress={() => setShowModal(false)}>Cancel</Button>
      <Button variant="primary" onPress={handleConfirm}>Confirm</Button>
    </>
  }
>
  <Text>Are you sure you want to assign this job?</Text>
</Modal>
```

#### Loading Component
```typescript
interface LoadingProps {
  type: 'spinner' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

// Usage
<Loading type="spinner" size="md" text="Loading contractors..." />
<Loading type="skeleton" /> // Shows skeleton cards
```

#### Empty State Component
```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Usage
<EmptyState
  icon={<Icon name="briefcase" size={48} />}
  title="No Jobs Found"
  description="Create your first job to get started"
  action={{
    label: "Create Job",
    onPress: () => navigate('/jobs/new')
  }}
/>
```

### 6.2 Feature-Specific Components

#### ScoreBreakdown Component
```typescript
interface ScoreBreakdownProps {
  availability: number; // 0.0 - 1.0
  rating: number;       // 0.0 - 1.0
  distance: number;     // 0.0 - 1.0
  totalScore: number;   // 0.0 - 1.0
  showDetails?: boolean;
}

// Displays horizontal bar chart of score components
```

#### TimeSlotPicker Component
```typescript
interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
  disabled?: boolean;
}

// Displays available time slots as selectable cards
```

#### ContractorAvatar Component
```typescript
interface ContractorAvatarProps {
  name: string;
  imageUrl?: string;
  size: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'busy';
}

// Shows contractor avatar with status indicator
```

---

## 7. State Management

### 7.1 Global State (Redux Toolkit / Zustand)

**Auth Slice**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: Permissions;
}

// Actions
- login(credentials)
- logout()
- refreshToken()
- updateUser(user)
```

**UI Slice**
```typescript
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

// Actions
- toggleSidebar()
- setTheme(theme)
- addNotification(notification)
- removeNotification(id)
```

**Notification Slice**
```typescript
interface NotificationState {
  unreadCount: number;
  items: Notification[];
}

// Actions
- addNotification(notification)
- markAsRead(id)
- clearAll()
```

### 7.2 Server State (React Query)

**Contractors Query**
```typescript
const useContractors = (filters: ContractorFilters) => {
  return useQuery({
    queryKey: ['contractors', filters],
    queryFn: () => api.contractors.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

const useContractor = (id: string) => {
  return useQuery({
    queryKey: ['contractors', id],
    queryFn: () => api.contractors.getById(id),
    enabled: !!id
  });
};

const useCreateContractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.contractors.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['contractors']);
    }
  });
};
```

**Jobs Query**
```typescript
const useJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.jobs.getAll(filters),
    refetchInterval: 30000 // Refetch every 30 seconds
  });
};

const useJob = (id: string) => {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => api.jobs.getById(id)
  });
};
```

**Recommendations Query**
```typescript
const useRecommendations = (jobId: string) => {
  return useQuery({
    queryKey: ['recommendations', jobId],
    queryFn: () => api.recommendations.get({ jobId }),
    enabled: !!jobId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2
  });
};
```

### 7.3 Form State (React Hook Form)

```typescript
const ContractorForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<ContractorFormData>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      workingHours: defaultWorkingHours
    }
  });

  const onSubmit = async (data: ContractorFormData) => {
    // Handle submission
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </Form>
  );
};
```

---

## 8. Real-Time Communication

### 8.1 SignalR Integration

**Connection Setup**
```typescript
// hooks/useSignalR.ts
export const useSignalR = () => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/notifications`, {
        accessTokenFactory: () => getAccessToken()
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => {
        console.log('SignalR Connected');
        setConnectionState('connected');
      })
      .catch(err => {
        console.error('SignalR Connection Error:', err);
        setConnectionState('error');
      });

    newConnection.onreconnecting(() => {
      setConnectionState('reconnecting');
    });

    newConnection.onreconnected(() => {
      setConnectionState('connected');
    });

    return () => {
      newConnection.stop();
    };
  }, []);

  return { connection, connectionState };
};
```

### 8.2 Event Subscriptions

**Job Assignment Events**
```typescript
// In Dashboard or Job List components
const { connection } = useSignalR();
const queryClient = useQueryClient();

useEffect(() => {
  if (!connection) return;

  connection.on('JobAssigned', (payload: JobAssignedEvent) => {
    // Update local cache
    queryClient.invalidateQueries(['jobs']);

    // Show notification
    showNotification({
      type: 'success',
      message: `Job ${payload.jobNumber} assigned to ${payload.contractorName}`
    });

    // Play sound (optional)
    playNotificationSound();
  });

  return () => {
    connection.off('JobAssigned');
  };
}, [connection]);
```

**Schedule Update Events**
```typescript
connection.on('ScheduleUpdated', (payload: ScheduleUpdatedEvent) => {
  queryClient.invalidateQueries(['contractors', payload.contractorId]);
  queryClient.invalidateQueries(['recommendations']); // Recalculate if needed
});
```

**Contractor Rating Events**
```typescript
connection.on('ContractorRated', (payload: ContractorRatedEvent) => {
  queryClient.setQueryData(
    ['contractors', payload.contractorId],
    (old: Contractor) => ({
      ...old,
      rating: payload.newRating
    })
  );
});
```

---

## 9. API Integration

### 9.1 Axios Client Configuration

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, refresh or redirect to login
      await refreshToken();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 9.2 API Endpoint Functions

**Contractors API**
```typescript
// api/endpoints/contractors.ts
export const contractorsApi = {
  getAll: (params: GetContractorsParams) =>
    apiClient.get<GetContractorsResponse>('/api/contractors', { params }),

  getById: (id: string) =>
    apiClient.get<Contractor>(`/api/contractors/${id}`),

  create: (data: CreateContractorRequest) =>
    apiClient.post<Contractor>('/api/contractors', data),

  update: (id: string, data: UpdateContractorRequest) =>
    apiClient.put<Contractor>(`/api/contractors/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/contractors/${id}`),

  getSchedule: (id: string, startDate: string, endDate: string) =>
    apiClient.get<ContractorSchedule>(`/api/contractors/${id}/schedule`, {
      params: { startDate, endDate }
    })
};
```

**Jobs API**
```typescript
// api/endpoints/jobs.ts
export const jobsApi = {
  getAll: (params: GetJobsParams) =>
    apiClient.get<GetJobsResponse>('/api/jobs', { params }),

  getById: (id: string) =>
    apiClient.get<Job>(`/api/jobs/${id}`),

  create: (data: CreateJobRequest) =>
    apiClient.post<Job>('/api/jobs', data),

  update: (id: string, data: UpdateJobRequest) =>
    apiClient.put<Job>(`/api/jobs/${id}`, data),

  cancel: (id: string, reason: string) =>
    apiClient.post(`/api/jobs/${id}/cancel`, { reason })
};
```

**Recommendations API**
```typescript
// api/endpoints/recommendations.ts
export const recommendationsApi = {
  get: (params: GetRecommendationsParams) =>
    apiClient.get<RecommendationResponse>('/api/recommendations', { params })
};
```

**Assignments API**
```typescript
// api/endpoints/assignments.ts
export const assignmentsApi = {
  create: (data: CreateAssignmentRequest) =>
    apiClient.post<Assignment>('/api/assignments', data),

  getById: (id: string) =>
    apiClient.get<Assignment>(`/api/assignments/${id}`),

  confirm: (id: string) =>
    apiClient.post(`/api/assignments/${id}/confirm`),

  cancel: (id: string, reason: string) =>
    apiClient.post(`/api/assignments/${id}/cancel`, { reason })
};
```

---

## 10. Routing & Navigation

### 10.1 Route Configuration

```typescript
// navigation/AppNavigator.tsx
export type RootStackParamList = {
  Dashboard: undefined;
  JobList: undefined;
  JobDetails: { jobId: string };
  CreateJob: undefined;
  Recommendations: { jobId: string };
  ContractorList: undefined;
  ContractorDetails: { contractorId: string };
  CreateContractor: undefined;
  EditContractor: { contractorId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="JobList" component={JobListScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="CreateJob" component={CreateJobScreen} />
      <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
      <Stack.Screen name="ContractorList" component={ContractorListScreen} />
      <Stack.Screen name="ContractorDetails" component={ContractorDetailsScreen} />
      <Stack.Screen name="CreateContractor" component={CreateContractorScreen} />
      <Stack.Screen name="EditContractor" component={EditContractorScreen} />
    </Stack.Navigator>
  );
};
```

### 10.2 Navigation Patterns

**Type-Safe Navigation**
```typescript
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyComponent = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleViewJob = (jobId: string) => {
    navigation.navigate('JobDetails', { jobId });
  };
};
```

**Deep Linking**
```typescript
const linking = {
  prefixes: ['smartscheduler://', 'https://smartscheduler.com'],
  config: {
    screens: {
      Dashboard: 'dashboard',
      JobList: 'jobs',
      JobDetails: 'jobs/:jobId',
      Recommendations: 'jobs/:jobId/recommendations',
      ContractorList: 'contractors',
      ContractorDetails: 'contractors/:contractorId'
    }
  }
};
```

---

## 11. Forms & Validation

### 11.1 Validation Schema

**Contractor Form Validation**
```typescript
import { z } from 'zod';

const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
const zipRegex = /^\d{5}$/;

export const contractorSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),

  type: z.nativeEnum(ContractorType),

  phone: z.string()
    .regex(phoneRegex, 'Phone must be in format (XXX) XXX-XXXX'),

  email: z.string()
    .email('Invalid email address'),

  address: z.string()
    .min(5, 'Address is required'),

  city: z.string()
    .min(2, 'City is required'),

  state: z.string()
    .length(2, 'State must be 2-letter code'),

  zipCode: z.string()
    .regex(zipRegex, 'Zip code must be 5 digits'),

  workingHours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string()
  })).min(1, 'At least one working day is required')
});
```

**Job Form Validation**
```typescript
export const jobSchema = z.object({
  type: z.nativeEnum(JobType),

  desiredDate: z.date()
    .min(new Date(), 'Date must be in the future'),

  duration: z.number()
    .min(30, 'Duration must be at least 30 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),

  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().regex(zipRegex),

  specialRequirements: z.array(z.string()).optional()
});
```

### 11.2 Form Error Display

```typescript
const FormInput = ({ name, control, label, ...props }) => {
  const {
    field,
    fieldState: { error }
  } = useController({ name, control });

  return (
    <View>
      <Label>{label}</Label>
      <Input
        {...props}
        value={field.value}
        onChangeText={field.onChange}
        error={!!error}
      />
      {error && <ErrorText>{error.message}</ErrorText>}
    </View>
  );
};
```

---

## 12. Error Handling

### 12.1 Error Boundary

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorLayout>
          <ErrorMessage error={this.state.error} />
          <Button onPress={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </ErrorLayout>
      );
    }

    return this.props.children;
  }
}
```

### 12.2 API Error Handling

```typescript
const useApiError = () => {
  const showNotification = useNotification();

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'An error occurred';
      const status = error.response?.status;

      if (status === 400) {
        showNotification({ type: 'error', message: 'Invalid request' });
      } else if (status === 401) {
        showNotification({ type: 'error', message: 'Unauthorized' });
        // Redirect to login
      } else if (status === 404) {
        showNotification({ type: 'error', message: 'Resource not found' });
      } else if (status === 500) {
        showNotification({ type: 'error', message: 'Server error' });
      } else {
        showNotification({ type: 'error', message });
      }
    } else {
      showNotification({ type: 'error', message: 'Unexpected error' });
    }
  };

  return { handleError };
};
```

### 12.3 Network Error Handling

```typescript
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Usage in components
const MyComponent = () => {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return <OfflineMessage />;
  }

  return <NormalContent />;
};
```

---

## 13. Performance Requirements

### 13.1 Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load Time | < 2s | Time to interactive |
| Route Transition | < 300ms | Navigation between screens |
| API Response Rendering | < 100ms | Data fetch to UI update |
| Form Submission | < 500ms | Submit click to response |
| Search Debounce | 300ms | Input to API call |
| List Scroll Performance | 60fps | Maintain smooth scrolling |

### 13.2 Optimization Techniques

**Code Splitting**
```typescript
// Lazy load screens
const JobDetailsScreen = React.lazy(() => import('./screens/JobDetailsScreen'));
const ContractorDetailsScreen = React.lazy(() => import('./screens/ContractorDetailsScreen'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <JobDetailsScreen />
</Suspense>
```

**Memoization**
```typescript
// Memoize expensive computations
const sortedContractors = useMemo(() => {
  return contractors.sort((a, b) => b.rating - a.rating);
}, [contractors]);

// Memoize components
const ContractorCard = React.memo(({ contractor }) => {
  return <Card>{/* ... */}</Card>;
});
```

**Virtualization**
```typescript
import { FlatList } from 'react-native';

<FlatList
  data={contractors}
  renderItem={({ item }) => <ContractorCard contractor={item} />}
  keyExtractor={(item) => item?.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

**Image Optimization**
```typescript
// Use optimized image component
<FastImage
  source={{ uri: contractor.imageUrl }}
  style={styles.image}
  resizeMode="cover"
  priority="normal"
/>
```

---

## 14. Accessibility Requirements

### 14.1 WCAG 2.1 Level AA Compliance

**Keyboard Navigation**
- All interactive elements accessible via keyboard
- Tab order follows logical flow
- Focus indicators clearly visible
- Skip navigation links provided

**Screen Reader Support**
```typescript
<Button
  accessible={true}
  accessibilityLabel="Assign contractor John Smith to job 1234"
  accessibilityHint="Double tap to confirm assignment"
>
  Assign
</Button>
```

**Color Contrast**
- Text contrast ratio minimum 4.5:1 for normal text
- Text contrast ratio minimum 3:1 for large text
- UI component contrast ratio minimum 3:1

**Responsive Text Sizing**
- Support system font size settings
- Text scales up to 200% without loss of functionality

### 14.2 Accessibility Features

**Form Labels**
```typescript
<View>
  <Label accessibilityLabel="Contractor name">Name *</Label>
  <Input
    accessibilityLabel="Enter contractor name"
    accessibilityRequired={true}
  />
</View>
```

**Error Announcements**
```typescript
{error && (
  <Text
    accessibilityRole="alert"
    accessibilityLive="assertive"
  >
    {error.message}
  </Text>
)}
```

**Loading States**
```typescript
<ActivityIndicator
  accessibilityLabel="Loading contractors"
  accessibilityLive="polite"
/>
```

---

## 15. Testing Requirements

### 15.1 Unit Testing

**Component Tests**
```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ContractorCard } from './ContractorCard';

describe('ContractorCard', () => {
  const mockContractor = {
    id: '1',
    name: 'John Smith',
    type: ContractorType.Flooring,
    rating: 4.8
  };

  it('renders contractor information correctly', () => {
    render(<ContractorCard contractor={mockContractor} />);

    expect(screen.getByText('John Smith')).toBeTruthy();
    expect(screen.getByText('4.8')).toBeTruthy();
  });

  it('calls onPress when card is tapped', () => {
    const onPress = jest.fn();
    render(<ContractorCard contractor={mockContractor} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('contractor-card'));
    expect(onPress).toHaveBeenCalledWith('1');
  });
});
```

**Hook Tests**
```typescript
import { renderHook, waitFor } from '@testing-library/react-hooks';
import { useContractors } from './useContractors';

describe('useContractors', () => {
  it('fetches contractors successfully', async () => {
    const { result } = renderHook(() => useContractors());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(10);
  });
});
```

### 15.2 Integration Testing

**User Flow Tests**
```typescript
describe('Job Assignment Flow', () => {
  it('allows dispatcher to assign contractor to job', async () => {
    // Navigate to job list
    render(<App />);
    fireEvent.press(screen.getByText('Jobs'));

    // Click on a job
    await waitFor(() => screen.getByText('Job #1234'));
    fireEvent.press(screen.getByText('Job #1234'));

    // Request recommendations
    fireEvent.press(screen.getByText('Get Recommendations'));

    // Select contractor
    await waitFor(() => screen.getByText('John Smith'));
    fireEvent.press(screen.getByText('Assign to This Contractor'));

    // Confirm assignment
    fireEvent.press(screen.getByText('Confirm'));

    // Verify success message
    await waitFor(() => screen.getByText('Job assigned successfully'));
  });
});
```

### 15.3 E2E Testing

**Detox Tests**
```typescript
describe('SmartScheduler E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show dashboard after login', async () => {
    await element(by.id('email-input')).typeText('dispatcher@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Dashboard'))).toBeVisible();
  });

  it('should create new contractor', async () => {
    await element(by.text('Contractors')).tap();
    await element(by.id('add-contractor-button')).tap();

    await element(by.id('name-input')).typeText('John Smith');
    await element(by.id('type-picker')).tap();
    await element(by.text('Flooring')).tap();

    await element(by.id('save-button')).tap();

    await expect(element(by.text('Contractor created successfully'))).toBeVisible();
  });
});
```

### 15.4 Testing Coverage Requirements

- **Unit Tests**: 80% code coverage minimum
- **Integration Tests**: All critical user flows covered
- **E2E Tests**: Happy path and major error scenarios
- **Accessibility Tests**: All interactive elements tested
- **Performance Tests**: Load time, rendering performance validated

---

## 16. Deployment & Build Configuration

### 16.1 Environment Configuration

```typescript
// config/env.ts
export const env = {
  API_URL: process.env.REACT_APP_API_URL,
  SIGNALR_URL: process.env.REACT_APP_SIGNALR_URL,
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  ENV: process.env.NODE_ENV
};

// Validate required env vars
const requiredEnvVars = ['REACT_APP_API_URL', 'REACT_APP_SIGNALR_URL'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### 16.2 Build Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "web": "expo start --web",
    "build:web": "expo build:web",
    "build:ios": "expo build:ios",
    "build:android": "expo build:android",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Appendix A: Design System

### Color Palette
```typescript
export const colors = {
  primary: '#2563EB',      // Blue
  secondary: '#64748B',    // Slate
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  danger: '#EF4444',       // Red
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    disabled: '#CBD5E1'
  }
};
```

### Typography
```typescript
export const typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 }
};
```

### Spacing
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
```

---

**Document Control**
- **Created**: 2025-11-08
- **Author**: Mary, Business Analyst
- **Status**: Draft - Pending Review
- **Next Steps**: Review with development team, create API specification document
