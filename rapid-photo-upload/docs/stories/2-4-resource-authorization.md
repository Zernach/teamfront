# Story 2.4: Resource-Level Authorization

Status: drafted

## Story

As a system,
I want to enforce resource-level authorization checks,
so that users can only access their own photos and upload jobs.

## Acceptance Criteria

1. Authorization checks implemented in CommandHandlers
2. Authorization checks implemented in QueryHandlers
3. Verify userId in request matches authenticated user
4. Return 403 Forbidden for unauthorized access
5. Authorization middleware/filter created
6. All endpoints protected with authorization
7. Failed authorization attempts logged

## Tasks / Subtasks

- [ ] Task 1: Implement authorization in CommandHandlers (AC: 1)
  - [ ] Add authorization check to UploadPhotoCommandHandler
  - [ ] Add authorization check to RetryFailedUploadCommandHandler
  - [ ] Add authorization check to CreateUploadJobCommandHandler
  - [ ] Verify user owns the resource
- [ ] Task 2: Implement authorization in QueryHandlers (AC: 2)
  - [ ] Add authorization check to GetPhotoMetadataQueryHandler
  - [ ] Add authorization check to GetUploadJobStatusQueryHandler
  - [ ] Add authorization check to ListUserPhotosQueryHandler
  - [ ] Filter results by authenticated user
- [ ] Task 3: Verify user ownership (AC: 3)
  - [ ] Extract userId from authenticated principal
  - [ ] Compare with resource userId
  - [ ] Throw AuthorizationException if mismatch
- [ ] Task 4: Return 403 for unauthorized access (AC: 4)
  - [ ] Create AuthorizationException
  - [ ] Map to 403 Forbidden HTTP status
  - [ ] Return clear error message
- [ ] Task 5: Create authorization middleware (AC: 5)
  - [ ] Create JWT authentication filter
  - [ ] Extract and validate JWT token
  - [ ] Set authenticated principal in security context
- [ ] Task 6: Protect all endpoints (AC: 6)
  - [ ] Configure Spring Security
  - [ ] Protect API endpoints (except /auth/*)
  - [ ] Require authentication for all protected endpoints
- [ ] Task 7: Log failed authorization attempts (AC: 7)
  - [ ] Log authorization failures
  - [ ] Include user ID and resource ID
  - [ ] Include timestamp and IP address

## Dev Notes

- Use Spring Security for authentication/authorization
- Extract user from JWT token claims
- Verify ownership before any operation
- Never expose other users' data

### Project Structure Notes

- Security Config: `infrastructure/security/SecurityConfig.java`
- JWT Filter: `infrastructure/security/JwtAuthenticationFilter.java`
- Authorization checks in command/query handlers
- Exception: `domain/exceptions/AuthorizationException.java`

### References

- [Source: docs/epics/epic-2-authentication-authorization.md#Authorization]
- [Source: docs/epics/epic-2-authentication-authorization.md#Security Requirements]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

