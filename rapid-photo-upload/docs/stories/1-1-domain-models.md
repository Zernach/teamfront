# Story 1.1: Domain Models Implementation

Status: drafted

## Story

As a backend developer,
I want to implement the core domain models (Photo, UploadJob, User aggregates) with proper value objects and invariants,
so that the system has a solid foundation following Domain-Driven Design principles.

## Acceptance Criteria

1. Photo aggregate implemented with all value objects (PhotoId, Filename, FileSize, ContentType, UploadStatus, StorageKey, ThumbnailStorageKey, UploadedAt, UploadedBy, Metadata)
2. UploadJob aggregate implemented with value objects (JobId, UserId, Photos collection, TotalPhotos, CompletedPhotos, FailedPhotos, JobStatus, CreatedAt, CompletedAt, OverallProgress)
3. User aggregate implemented with value objects (UserId, Username, Email, PasswordHash, Roles, StorageQuota, UsedStorage, CreatedAt, LastLoginAt)
4. Domain events defined: PhotoUploadStarted, PhotoUploadProgressed, PhotoUploadCompleted, PhotoUploadFailed, UploadJobCreated, UploadJobProgressed, UploadJobCompleted, UploadJobFailed, UserRegistered, UserLoggedIn, StorageQuotaExceeded
5. Value objects enforce invariants (e.g., FileSize > 0, Username 3-50 chars, Email valid format)
6. Aggregates maintain consistency boundaries
7. Domain models are independent of infrastructure concerns

## Tasks / Subtasks

- [ ] Task 1: Implement Photo aggregate with value objects (AC: 1)
  - [ ] Create PhotoId value object (UUID, immutable)
  - [ ] Create Filename value object with validation rules
  - [ ] Create FileSize value object (bytes, must be > 0)
  - [ ] Create ContentType value object (MIME type validation)
  - [ ] Create UploadStatus enum (QUEUED, UPLOADING, COMPLETED, FAILED, CANCELLED)
  - [ ] Create StorageKey and ThumbnailStorageKey value objects
  - [ ] Create UploadedAt and UploadedBy value objects
  - [ ] Create Metadata entity collection
  - [ ] Define Photo domain events
- [ ] Task 2: Implement UploadJob aggregate with value objects (AC: 2)
  - [ ] Create JobId value object (UUID)
  - [ ] Create UserId value object
  - [ ] Create Photos collection (Collection<PhotoId>)
  - [ ] Create TotalPhotos, CompletedPhotos, FailedPhotos value objects
  - [ ] Create JobStatus enum (CREATED, IN_PROGRESS, COMPLETED, PARTIALLY_FAILED, FAILED)
  - [ ] Create CreatedAt, CompletedAt value objects
  - [ ] Implement OverallProgress calculation
  - [ ] Define UploadJob domain events
- [ ] Task 3: Implement User aggregate with value objects (AC: 3)
  - [ ] Create UserId value object (UUID)
  - [ ] Create Username value object (unique, 3-50 chars)
  - [ ] Create Email value object (validated email format)
  - [ ] Create PasswordHash value object (Bcrypt hashed)
  - [ ] Create Roles collection (USER, ADMIN)
  - [ ] Create StorageQuota and UsedStorage value objects
  - [ ] Create CreatedAt, LastLoginAt value objects
  - [ ] Define User domain events
- [ ] Task 4: Implement domain event infrastructure (AC: 4)
  - [ ] Define PhotoUploadStarted event
  - [ ] Define PhotoUploadProgressed event
  - [ ] Define PhotoUploadCompleted event
  - [ ] Define PhotoUploadFailed event
  - [ ] Define UploadJobCreated event
  - [ ] Define UploadJobProgressed event
  - [ ] Define UploadJobCompleted event
  - [ ] Define UploadJobFailed event
  - [ ] Define UserRegistered event
  - [ ] Define UserLoggedIn event
  - [ ] Define StorageQuotaExceeded event
- [ ] Task 5: Add validation and invariants to value objects (AC: 5)
  - [ ] FileSize validation (> 0)
  - [ ] Username validation (3-50 chars)
  - [ ] Email format validation
  - [ ] Other value object validations
- [ ] Task 6: Ensure aggregates maintain consistency boundaries (AC: 6)
  - [ ] Review aggregate boundaries
  - [ ] Ensure transactions respect aggregate boundaries
- [ ] Task 7: Verify domain models are infrastructure-independent (AC: 7)
  - [ ] No JPA annotations in domain layer
  - [ ] No framework dependencies in domain models
  - [ ] Pure Java/Kotlin domain logic

## Dev Notes

- Follow Domain-Driven Design principles strictly
- Value objects should be immutable
- Aggregates should enforce business invariants
- Domain events should be part of the domain model
- Keep domain layer free of infrastructure concerns

### Project Structure Notes

- Domain models go in `src/main/java/com/rapidphotoupload/domain/`
- Value objects in `domain/valueobjects/`
- Aggregates in `domain/aggregates/`
- Domain events in `domain/events/`
- Follow Vertical Slice Architecture organization

### References

- [Source: docs/epics/epic-1-backend-core.md#Domain Models (DDD)]
- [Source: docs/PRD.md#Architecture Quality Indicators]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

