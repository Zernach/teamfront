# Story 6.2: API Client and State Management Setup

Status: drafted

## Story

As a frontend developer,
I want to set up the API client with interceptors and global state management,
so that I can make authenticated API calls and manage application state efficiently.

## Acceptance Criteria

1. Axios API client configured with base URL
2. Request interceptor adds JWT token to headers
3. Response interceptor handles errors (401, 403, 500)
4. Token refresh logic implemented
5. Global state management set up (Zustand or Redux)
6. Auth state slice created (user, token, isAuthenticated)
7. React Query configured for server state
8. Error handling and retry logic configured

## Tasks / Subtasks

- [ ] Task 1: Configure Axios API client (AC: 1)
  - [ ] Create api client instance
  - [ ] Set base URL from environment
  - [ ] Configure default headers
  - [ ] Set timeout
- [ ] Task 2: Implement request interceptor (AC: 2)
  - [ ] Add JWT token to Authorization header
  - [ ] Get token from auth store
  - [ ] Handle missing token
- [ ] Task 3: Implement response interceptor (AC: 3)
  - [ ] Handle 401 Unauthorized (redirect to login)
  - [ ] Handle 403 Forbidden (show error)
  - [ ] Handle 500 Server Error (show error)
  - [ ] Handle network errors
- [ ] Task 4: Implement token refresh (AC: 4)
  - [ ] Detect 401 response
  - [ ] Attempt token refresh
  - [ ] Retry original request with new token
  - [ ] Redirect to login if refresh fails
- [ ] Task 5: Set up global state management (AC: 5)
  - [ ] Install and configure Zustand or Redux Toolkit
  - [ ] Create store structure
  - [ ] Set up store provider
- [ ] Task 6: Create auth state slice (AC: 6)
  - [ ] Create auth store/slice
  - [ ] Store user data
  - [ ] Store access token and refresh token
  - [ ] Store isAuthenticated flag
  - [ ] Create auth actions (login, logout, setUser)
- [ ] Task 7: Configure React Query (AC: 7)
  - [ ] Set up QueryClient
  - [ ] Configure default options
  - [ ] Set up QueryClientProvider
  - [ ] Configure cache settings
- [ ] Task 8: Configure error handling (AC: 8)
  - [ ] Set up error boundaries
  - [ ] Configure retry logic
  - [ ] Set up error notifications
  - [ ] Handle offline scenarios

## Dev Notes

- Use Axios interceptors for auth
- Store tokens securely (consider httpOnly cookies)
- Use React Query for server state, Zustand/Redux for client state
- Handle token expiration gracefully

### Project Structure Notes

- API Client: `src/services/api/client.ts`
- Interceptors: `src/services/api/interceptors.ts`
- Auth Store: `src/store/authStore.ts` or `src/store/slices/authSlice.ts`
- React Query Config: `src/services/queryClient.ts`

### References

- [Source: docs/epics/epic-6-web-frontend-core.md#Technology Stack]
- [Source: docs/epics/epic-2-authentication-authorization.md]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

