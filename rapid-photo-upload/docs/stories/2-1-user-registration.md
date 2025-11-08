# Story 2.1: User Registration Endpoint

Status: drafted

## Story

As a user,
I want to register a new account with username, email, and password,
so that I can access the photo upload system.

## Acceptance Criteria

1. `POST /auth/register` endpoint implemented
2. Username validation: 3-50 characters, unique
3. Email validation: valid email format, unique
4. Password validation: minimum 8 characters with complexity requirements
5. Password hashing using bcrypt (cost factor ≥ 10)
6. Returns: User ID, username, email, created timestamp
7. Error handling: 400 (validation failure), 409 (username/email exists)
8. User aggregate saved to database

## Tasks / Subtasks

- [ ] Task 1: Create registration endpoint (AC: 1)
  - [ ] Create RegisterController with POST /auth/register
  - [ ] Create RegisterRequest DTO
  - [ ] Create RegisterResponse DTO
  - [ ] Map request to command
- [ ] Task 2: Implement username validation (AC: 2)
  - [ ] Validate length (3-50 characters)
  - [ ] Check uniqueness in database
  - [ ] Return appropriate error if invalid
- [ ] Task 3: Implement email validation (AC: 3)
  - [ ] Validate email format
  - [ ] Check uniqueness in database
  - [ ] Return appropriate error if invalid
- [ ] Task 4: Implement password validation (AC: 4)
  - [ ] Validate minimum 8 characters
  - [ ] Check complexity requirements
  - [ ] Return appropriate error if invalid
- [ ] Task 5: Implement password hashing (AC: 5)
  - [ ] Configure bcrypt with cost factor ≥ 10
  - [ ] Hash password before saving
  - [ ] Never store plain text password
- [ ] Task 6: Return registration response (AC: 6)
  - [ ] Return User ID
  - [ ] Return username
  - [ ] Return email
  - [ ] Return created timestamp
- [ ] Task 7: Implement error handling (AC: 7)
  - [ ] Return 400 for validation failures
  - [ ] Return 409 for duplicate username/email
  - [ ] Provide clear error messages
- [ ] Task 8: Save user to database (AC: 8)
  - [ ] Create User aggregate
  - [ ] Save via UserRepository
  - [ ] Publish UserRegistered domain event

## Dev Notes

- Use RegisterUserCommand and RegisterUserCommandHandler
- Password should never be logged or exposed
- Follow CQRS pattern for command handling
- Validate all inputs server-side

### Project Structure Notes

- Controller: `api/controllers/AuthController.java`
- Command: `application/commands/RegisterUserCommand.java`
- Handler: `application/commands/handlers/RegisterUserCommandHandler.java`
- DTOs: `api/dto/RegisterRequest.java`, `api/dto/RegisterResponse.java`

### References

- [Source: docs/epics/epic-2-authentication-authorization.md#User Registration]
- [Source: docs/epics/epic-1-backend-core.md#User Aggregate]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

