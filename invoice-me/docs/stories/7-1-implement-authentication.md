# Story 7.1: Implement Authentication and Authorization

Status: drafted

## Story

As a user,
I want to authenticate and authorize access to the application,
so that only authorized users can access the system.

## Acceptance Criteria

1. User can login with email and password
2. Backend validates credentials against users table
3. Backend generates JWT access token (15 min expiry) and refresh token (7 day expiry)
4. Password requirements are enforced: min 8 chars, uppercase, lowercase, number, special char
5. Passwords are hashed using BCrypt
6. Frontend stores tokens securely (AsyncStorage or Secure Store)
7. Frontend includes access token in Authorization header for API requests
8. Backend validates JWT token on protected endpoints
9. On 401 response, frontend attempts token refresh
10. If refresh fails, frontend redirects to login
11. User can logout (invalidates token)
12. API returns 200 OK with AuthResponse (token, refreshToken, user info) on successful login
13. API returns 401 Unauthorized for invalid credentials
14. API returns 401 Unauthorized for invalid/expired tokens

## Tasks / Subtasks

- [ ] Task 1: Implement User entity and repository (AC: 2, 4-5)
  - [ ] Create User domain entity
  - [ ] Create UserEntity JPA entity
  - [ ] Create UserRepository interface and implementation
  - [ ] Implement password hashing with BCrypt
  - [ ] Implement password validation
- [ ] Task 2: Implement JWT token generation and validation (AC: 3, 8)
  - [ ] Add JWT library dependency (jjwt)
  - [ ] Create JwtTokenService for token generation
  - [ ] Create JwtTokenProvider for token validation
  - [ ] Configure JWT secret and expiration times
  - [ ] Implement access token generation
  - [ ] Implement refresh token generation
  - [ ] Implement token validation
- [ ] Task 3: Implement authentication endpoints (AC: 1, 12-13)
  - [ ] Create AuthController with POST /api/v1/auth/login endpoint
  - [ ] Create LoginRequestDto
  - [ ] Create AuthResponseDto
  - [ ] Implement login logic: validate credentials, generate tokens
  - [ ] Implement logout endpoint: POST /api/v1/auth/logout
  - [ ] Implement refresh token endpoint: POST /api/v1/auth/refresh
  - [ ] Implement get current user endpoint: GET /api/v1/auth/me
- [ ] Task 4: Configure Spring Security (AC: 8)
  - [ ] Add Spring Security dependency
  - [ ] Create SecurityConfig class
  - [ ] Configure JWT authentication filter
  - [ ] Configure protected endpoints (all except /auth/login)
  - [ ] Configure CORS
  - [ ] Configure CSRF protection
- [ ] Task 5: Implement frontend authentication (AC: 6-7, 9-10)
  - [ ] Create AuthStore using Zustand
  - [ ] Implement login function
  - [ ] Implement token storage (AsyncStorage or Secure Store)
  - [ ] Implement API client interceptor to add Authorization header
  - [ ] Implement token refresh logic
  - [ ] Implement logout function
- [ ] Task 6: Create Login Screen (AC: 1, 6)
  - [ ] Create LoginScreen component
  - [ ] Create login form with email and password fields
  - [ ] Implement form validation
  - [ ] Implement login API call
  - [ ] Handle errors and display messages
  - [ ] Navigate to Dashboard on success
- [ ] Task 7: Write integration tests (AC: All)
  - [ ] Test successful login
  - [ ] Test invalid credentials (401)
  - [ ] Test token validation
  - [ ] Test token refresh
  - [ ] Test protected endpoint access
  - [ ] Test logout

## Dev Notes

- Use JWT for stateless authentication
- Store refresh tokens securely
- Use BCrypt for password hashing (cost factor 10-12)
- Implement proper token expiration and refresh flow
- Secure token storage on frontend (use Secure Store on mobile)
- Configure CORS properly for frontend origin
- Use Spring Security for endpoint protection

### Project Structure Notes

- Backend: `src/main/java/com/invoiceme/security/`
- Security Config: `security/config/SecurityConfig.java`
- JWT Service: `security/services/JwtTokenService.java`
- Auth Controller: `security/api/AuthController.java`
- Frontend: `frontend/features/auth/`

### References

- [Source: docs/epics/epic-7-security-authentication.md#7.1 Authentication Flow]
- [Source: docs/epics/epic-7-security-authentication.md#7.2 Password Requirements]
- [Source: docs/epics/epic-7-security-authentication.md#7.3 API Security]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

