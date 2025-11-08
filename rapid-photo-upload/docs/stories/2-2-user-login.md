# Story 2.2: User Login and JWT Token Generation

Status: drafted

## Story

As a user,
I want to log in with my username/email and password,
so that I receive a JWT access token to authenticate API requests.

## Acceptance Criteria

1. `POST /auth/login` endpoint implemented
2. Accepts username/email and password
3. Validates credentials against database
4. Generates JWT access token (expires in 1 hour)
5. Generates JWT refresh token (expires in 7 days)
6. Token includes claims: user ID, username, roles
7. Returns: access token, refresh token, expiration time
8. Updates User lastLoginAt timestamp
9. Publishes UserLoggedIn domain event

## Tasks / Subtasks

- [ ] Task 1: Create login endpoint (AC: 1)
  - [ ] Create LoginController with POST /auth/login
  - [ ] Create LoginRequest DTO
  - [ ] Create LoginResponse DTO
  - [ ] Map request to command
- [ ] Task 2: Implement credential validation (AC: 2, 3)
  - [ ] Accept username or email
  - [ ] Find user by username or email
  - [ ] Verify password using bcrypt
  - [ ] Return 401 if invalid credentials
- [ ] Task 3: Generate JWT access token (AC: 4)
  - [ ] Configure JWT signing (HS256 or RS256)
  - [ ] Set expiration to 1 hour
  - [ ] Include claims: sub (user ID), username, roles
  - [ ] Sign token securely
- [ ] Task 4: Generate JWT refresh token (AC: 5)
  - [ ] Generate separate refresh token
  - [ ] Set expiration to 7 days
  - [ ] Store refresh token securely (optional: database)
- [ ] Task 5: Include required claims in tokens (AC: 6)
  - [ ] Add "sub" claim with user ID
  - [ ] Add "username" claim
  - [ ] Add "roles" claim (array)
  - [ ] Add "iat" (issued at) and "exp" (expiration) claims
- [ ] Task 6: Return login response (AC: 7)
  - [ ] Return access token
  - [ ] Return refresh token
  - [ ] Return expiration time
  - [ ] Return token type ("Bearer")
- [ ] Task 7: Update user last login (AC: 8)
  - [ ] Update User.lastLoginAt
  - [ ] Save via UserRepository
- [ ] Task 8: Publish domain event (AC: 9)
  - [ ] Publish UserLoggedIn event
  - [ ] Include user ID and timestamp

## Dev Notes

- Use LoginCommand and LoginCommandHandler
- Never log passwords or tokens
- Use secure JWT library (jjwt or similar)
- Store refresh tokens securely if needed

### Project Structure Notes

- Controller: `api/controllers/AuthController.java`
- Command: `application/commands/LoginCommand.java`
- Handler: `application/commands/handlers/LoginCommandHandler.java`
- JWT Service: `infrastructure/security/JwtTokenService.java`
- DTOs: `api/dto/LoginRequest.java`, `api/dto/LoginResponse.java`

### References

- [Source: docs/epics/epic-2-authentication-authorization.md#User Authentication]
- [Source: docs/epics/epic-1-backend-core.md#User Aggregate]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

