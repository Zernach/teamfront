# Story 1.5: Repository Interfaces Definition

Status: drafted

## Story

As a backend developer,
I want to define repository interfaces in the domain layer,
so that the domain models can be persisted without depending on infrastructure implementations.

## Acceptance Criteria

1. Repository interfaces defined in domain layer
2. PhotoRepository interface with required methods
3. UploadJobRepository interface with required methods
4. UserRepository interface with required methods
5. TagRepository interface with required methods
6. Repository interfaces follow DDD patterns
7. No infrastructure dependencies in interfaces

## Tasks / Subtasks

- [ ] Task 1: Create repository base interface (AC: 1)
  - [ ] Define generic repository interface pattern
  - [ ] Include common methods (save, findById, delete)
  - [ ] Keep in domain layer
- [ ] Task 2: Define PhotoRepository interface (AC: 2)
  - [ ] Methods: save(Photo), findById(PhotoId), findByUserId(UserId), findByStatus(UploadStatus)
  - [ ] Use domain types (Photo, PhotoId, UserId)
  - [ ] No JPA annotations in interface
- [ ] Task 3: Define UploadJobRepository interface (AC: 3)
  - [ ] Methods: save(UploadJob), findById(JobId), findByUserId(UserId), findByStatus(JobStatus)
  - [ ] Use domain types (UploadJob, JobId, UserId)
  - [ ] No JPA annotations in interface
- [ ] Task 4: Define UserRepository interface (AC: 4)
  - [ ] Methods: save(User), findById(UserId), findByUsername(String), findByEmail(String)
  - [ ] Use domain types (User, UserId)
  - [ ] No JPA annotations in interface
- [ ] Task 5: Define TagRepository interface (AC: 5)
  - [ ] Methods: save(Tag), findById(TagId), findByName(String), findByPhotoId(PhotoId)
  - [ ] Use domain types
  - [ ] No JPA annotations in interface
- [ ] Task 6: Ensure DDD patterns (AC: 6)
  - [ ] Repositories return domain aggregates
  - [ ] Repositories use domain value objects as parameters
  - [ ] No DTOs or infrastructure types in interfaces
- [ ] Task 7: Verify no infrastructure dependencies (AC: 7)
  - [ ] No JPA annotations
  - [ ] No Spring Data interfaces
  - [ ] Pure Java interfaces

## Dev Notes

- Repository interfaces belong in domain layer
- Implementations will be in infrastructure layer
- Interfaces should use domain types only
- Follow aggregate root pattern

### Project Structure Notes

- Repository interfaces: `src/main/java/com/rapidphotoupload/domain/repositories/`
- Implementations: `src/main/java/com/rapidphotoupload/infrastructure/persistence/repositories/`
- Keep domain layer clean of infrastructure concerns

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

