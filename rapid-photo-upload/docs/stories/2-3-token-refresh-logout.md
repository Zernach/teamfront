# Story 2.3: Token Refresh and Logout

Status: drafted

## Story

As a user,
I want to refresh my access token and logout securely,
so that I can maintain my session and securely end it when needed.

## Acceptance Criteria

1. `POST /auth/refresh` endpoint implemented
2. Accepts refresh token in request
3. Validates refresh token
4. Generates new access token and refresh token
5. Invalidates old refresh token
6. `POST /auth/logout` endpoint implemented
7. Logout invalidates tokens
8. Returns success response

## Tasks / Subtasks

- [ ] Task 1: Create token refresh endpoint (AC: 1)
  - [ ] Create RefreshController with POST /auth/refresh
  - [ ] Create RefreshRequest DTO
  - [ ] Create RefreshResponse DTO
- [ ] Task 2: Accept refresh token (AC: 2)
  - [ ] Extract refresh token from request
  - [ ] Validate token format
- [ ] Task 3: Validate refresh token (AC: 3)
  - [ ] Verify token signature
  - [ ] Check token expiration
  - [ ] Verify token hasn't been revoked
  - [ ] Return 401 if invalid
- [ ] Task 4: Generate new tokens (AC: 4)
  - [ ] Generate new access token (1 hour expiration)
  - [ ] Generate new refresh token (7 days expiration)
  - [ ] Include same claims as original tokens
- [ ] Task 5: Invalidate old refresh token (AC: 5)
  - [ ] Mark old refresh token as invalid
  - [ ] Store invalidation in database or cache
- [ ] Task 6: Create logout endpoint (AC: 6)
  - [ ] Create LogoutController with POST /auth/logout
  - [ ] Extract token from Authorization header
  - [ ] Create LogoutResponse DTO
- [ ] Task 7: Implement token invalidation (AC: 7)
  - [ ] Add token to blacklist/invalidation list
  - [ ] Invalidate both access and refresh tokens
  - [ ] Store invalidation in database or cache
- [ ] Task 8: Return success response (AC: 8)
  - [ ] Return 200 OK for logout
  - [ ] Return success message

## Dev Notes

- Use RefreshTokenCommand and LogoutCommand
- Consider using Redis for token blacklist
- Refresh tokens should be single-use
- Logout should invalidate all user sessions if needed

### Project Structure Notes

- Controller: `api/controllers/AuthController.java`
- Commands: `application/commands/RefreshTokenCommand.java`, `application/commands/LogoutCommand.java`
- Handlers: `application/commands/handlers/RefreshTokenCommandHandler.java`, `application/commands/handlers/LogoutCommandHandler.java`
- Token Service: `infrastructure/security/TokenInvalidationService.java`

### References

- [Source: docs/epics/epic-2-authentication-authorization.md#Session Management]
- [Source: docs/epics/epic-2-authentication-authorization.md#Token Refresh]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

