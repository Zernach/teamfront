# Epic 2: Authentication & Authorization

**Epic ID:** 2  
**Title:** Authentication & Authorization  
**Description:** JWT, user management

## Overview

Implement secure user authentication and authorization using JWT tokens. This includes user registration, login, session management, and resource-level authorization to ensure users can only access their own data.

## User Registration

### Requirements
- Username: 3-50 characters, unique
- Email: Valid email format, unique
- Password: Minimum 8 characters with complexity requirements
- Password hashing using bcrypt (cost factor ≥ 10)

### Endpoints
- `POST /auth/register` - Register new user
- Returns: User ID, username, email, created timestamp
- Errors: 400 (validation failure), 409 (username/email exists)

## User Authentication

### Login Flow
- `POST /auth/login` - Authenticate user
- Request: username/email and password
- Response: JWT access token, refresh token, expiration time
- Access token expires in 1 hour
- Refresh token expires in 7 days

### Token Structure
```json
{
  "sub": "user-uuid",
  "username": "john_doe",
  "roles": ["USER"],
  "iat": 1699564800,
  "exp": 1699568400
}
```

### Token Generation
- JWT signed using HS256 or RS256
- Claims include user ID, username, roles
- Secure token storage on client side

## Session Management

### Token Refresh
- `POST /auth/refresh` - Refresh access token using refresh token
- Returns new access token and refresh token
- Invalidates old refresh token

### Logout
- Token invalidation on logout
- Optional: Single session enforcement per user

## Authorization

### Resource-Level Authorization
- Users can only access their own photos and upload jobs
- Authorization checks in CommandHandlers and QueryHandlers
- Verify `userId` in request matches authenticated user
- Return 403 Forbidden for unauthorized access

### Security Configuration
- JWT validation in Authorization header
- Stateless session management
- CSRF protection disabled for API (using tokens)
- Secure password storage (never logged)

## Security Requirements

- Passwords hashed with bcrypt (cost factor ≥ 10)
- JWT tokens signed and validated
- Token expiration enforced
- Failed authorization logged
- Database connections use SSL/TLS
- Sensitive data not logged

## Acceptance Criteria

- [ ] User registration endpoint implemented with validation
- [ ] Login endpoint returns JWT tokens
- [ ] Token refresh endpoint functional
- [ ] Logout invalidates tokens
- [ ] Resource-level authorization checks implemented
- [ ] Security configuration applied
- [ ] Password hashing implemented
- [ ] Token validation middleware in place

## Dependencies

- Epic 1: Backend Core (User aggregate)
- Spring Security
- JWT library (jjwt or similar)
- Bcrypt password encoder

## Related Epics

- Epic 3: Upload API (requires authentication)
- Epic 4: Photo Query API (requires authorization)
- Epic 6: Web Frontend Core (client-side auth)
- Epic 9: Mobile Frontend Core (client-side auth)

