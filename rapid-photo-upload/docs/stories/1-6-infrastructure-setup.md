# Story 1.6: Infrastructure Setup

Status: drafted

## Story

As a backend developer,
I want to set up the infrastructure layer with database configuration, cloud storage interfaces, repository implementations, and domain event publishing,
so that the application can connect to external services and persist data.

## Acceptance Criteria

1. PostgreSQL database configuration completed
2. Cloud storage service interfaces defined (S3/Azure)
3. Repository implementations created
4. Domain event publishing infrastructure in place
5. Exception handling framework established
6. Configuration management set up

## Tasks / Subtasks

- [ ] Task 1: Configure PostgreSQL database (AC: 1)
  - [ ] Set up database connection configuration
  - [ ] Configure connection pool (HikariCP)
  - [ ] Set up transaction management
  - [ ] Configure JPA/Hibernate settings
- [ ] Task 2: Define cloud storage service interfaces (AC: 2)
  - [ ] Create PhotoStorageService interface
  - [ ] Define methods: uploadPhoto, downloadPhoto, deletePhoto, generatePresignedUrl
  - [ ] Create S3PhotoStorageService implementation stub
  - [ ] Create AzureBlobPhotoStorageService implementation stub
- [ ] Task 3: Implement repository implementations (AC: 3)
  - [ ] Implement PhotoRepositoryImpl using JPA
  - [ ] Implement UploadJobRepositoryImpl using JPA
  - [ ] Implement UserRepositoryImpl using JPA
  - [ ] Implement TagRepositoryImpl using JPA
  - [ ] Map domain models to JPA entities
- [ ] Task 4: Set up domain event publishing (AC: 4)
  - [ ] Create domain event publisher interface
  - [ ] Implement Spring Events-based publisher
  - [ ] Set up event listener infrastructure
  - [ ] Create event handlers for domain events
- [ ] Task 5: Establish exception handling framework (AC: 5)
  - [ ] Create custom exception classes
  - [ ] Set up global exception handler
  - [ ] Define error response DTOs
  - [ ] Map exceptions to HTTP status codes
- [ ] Task 6: Set up configuration management (AC: 6)
  - [ ] Create application.properties/yml
  - [ ] Externalize database configuration
  - [ ] Externalize cloud storage configuration
  - [ ] Set up environment-specific configs

## Dev Notes

- Infrastructure layer implements domain interfaces
- Keep infrastructure concerns separate from domain
- Use Spring Boot auto-configuration where appropriate
- Cloud storage implementations will be completed in Epic 3

### Project Structure Notes

- Infrastructure: `src/main/java/com/rapidphotoupload/infrastructure/`
- Persistence: `infrastructure/persistence/`
- Storage: `infrastructure/storage/`
- Events: `infrastructure/events/`
- Config: `infrastructure/config/`

### References

- [Source: docs/epics/epic-1-backend-core.md#Infrastructure Setup]
- [Source: docs/PRD.md#Infrastructure]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

