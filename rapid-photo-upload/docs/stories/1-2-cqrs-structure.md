# Story 1.2: CQRS Structure Setup

Status: drafted

## Story

As a backend developer,
I want to establish the CQRS (Command Query Responsibility Segregation) structure with clear separation between commands and queries,
so that read and write operations are optimized independently.

## Acceptance Criteria

1. Command side structure established with command objects (UploadPhotoCommand, RetryFailedUploadCommand, CreateUploadJobCommand)
2. Command handlers implemented with validation and business logic
3. Command results defined with success/failure status
4. Query side structure established with query objects (GetPhotoMetadataQuery, GetUploadJobStatusQuery, ListUserPhotosQuery)
5. Query handlers implemented optimized for read operations
6. DTOs defined for data transfer (PhotoDTO, UploadJobDTO)
7. Read-optimized views/materialized views planned

## Tasks / Subtasks

- [ ] Task 1: Set up command side structure (AC: 1)
  - [ ] Create command base class/interface
  - [ ] Define UploadPhotoCommand
  - [ ] Define RetryFailedUploadCommand
  - [ ] Define CreateUploadJobCommand
  - [ ] Organize commands in `application/commands/`
- [ ] Task 2: Implement command handlers (AC: 2)
  - [ ] Create command handler base interface
  - [ ] Implement UploadPhotoCommandHandler with validation
  - [ ] Implement RetryFailedUploadCommandHandler with business logic
  - [ ] Implement CreateUploadJobCommandHandler with validation
  - [ ] Organize handlers in `application/commands/handlers/`
- [ ] Task 3: Define command results (AC: 3)
  - [ ] Create CommandResult base class
  - [ ] Define success result structure
  - [ ] Define failure result structure with error details
- [ ] Task 4: Set up query side structure (AC: 4)
  - [ ] Create query base class/interface
  - [ ] Define GetPhotoMetadataQuery
  - [ ] Define GetUploadJobStatusQuery
  - [ ] Define ListUserPhotosQuery
  - [ ] Organize queries in `application/queries/`
- [ ] Task 5: Implement query handlers (AC: 5)
  - [ ] Create query handler base interface
  - [ ] Implement GetPhotoMetadataQueryHandler optimized for reads
  - [ ] Implement GetUploadJobStatusQueryHandler optimized for reads
  - [ ] Implement ListUserPhotosQueryHandler optimized for reads
  - [ ] Organize handlers in `application/queries/handlers/`
- [ ] Task 6: Define DTOs for data transfer (AC: 6)
  - [ ] Create PhotoDTO with all required fields
  - [ ] Create UploadJobDTO with all required fields
  - [ ] Ensure DTOs are separate from domain models
  - [ ] Organize DTOs in `application/dtos/`
- [ ] Task 7: Plan read-optimized views (AC: 7)
  - [ ] Design photo_view materialized view structure
  - [ ] Plan refresh strategy for materialized views
  - [ ] Document indexing strategy

## Dev Notes

- Commands modify state, queries read state
- Keep command and query sides completely separate
- DTOs should not expose domain model internals
- Query handlers should be optimized for read performance
- Materialized views will be implemented in Epic 4

### Project Structure Notes

- Commands: `src/main/java/com/rapidphotoupload/application/commands/`
- Command handlers: `application/commands/handlers/`
- Queries: `application/queries/`
- Query handlers: `application/queries/handlers/`
- DTOs: `application/dtos/`
- Follow Vertical Slice Architecture organization

### References

- [Source: docs/epics/epic-1-backend-core.md#CQRS Implementation]
- [Source: docs/PRD.md#Architecture Quality Indicators]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

