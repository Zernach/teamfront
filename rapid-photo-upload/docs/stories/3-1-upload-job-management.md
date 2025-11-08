# Story 3.1: Upload Job Management Endpoints

Status: drafted

## Story

As a user,
I want to create and track upload jobs,
so that I can manage batch photo uploads with progress tracking.

## Acceptance Criteria

1. `POST /jobs` endpoint implemented to create upload job
2. Accepts photoCount (max 100) in request
3. Returns: JobId, status, totalPhotos, createdAt
4. `GET /jobs/{jobId}` endpoint implemented to get job status
5. Returns: Job status, progress, photo list with individual statuses
6. Real-time progress calculation
7. Job tracks overall progress and status
8. Validates user owns the job

## Tasks / Subtasks

- [ ] Task 1: Create job creation endpoint (AC: 1)
  - [ ] Create JobController with POST /jobs
  - [ ] Create CreateJobRequest DTO
  - [ ] Create CreateJobResponse DTO
  - [ ] Map to CreateUploadJobCommand
- [ ] Task 2: Validate photoCount (AC: 2)
  - [ ] Accept photoCount parameter
  - [ ] Validate max 100 photos
  - [ ] Return 400 if exceeds limit
- [ ] Task 3: Return job creation response (AC: 3)
  - [ ] Return JobId (UUID)
  - [ ] Return status (CREATED)
  - [ ] Return totalPhotos
  - [ ] Return createdAt timestamp
- [ ] Task 4: Create job status endpoint (AC: 4)
  - [ ] Create GET /jobs/{jobId} endpoint
  - [ ] Create GetJobStatusQuery
  - [ ] Implement GetJobStatusQueryHandler
- [ ] Task 5: Return job status details (AC: 5)
  - [ ] Return job status (CREATED, IN_PROGRESS, COMPLETED, etc.)
  - [ ] Return overall progress percentage
  - [ ] Return list of photos with individual statuses
  - [ ] Return completedPhotos and failedPhotos counts
- [ ] Task 6: Calculate real-time progress (AC: 6)
  - [ ] Calculate progress: (completedPhotos / totalPhotos) * 100
  - [ ] Update progress on each photo completion
  - [ ] Return accurate progress percentage
- [ ] Task 7: Track job progress and status (AC: 7)
  - [ ] Update job status based on photo uploads
  - [ ] Update completedPhotos and failedPhotos counts
  - [ ] Update job status to COMPLETED when all done
- [ ] Task 8: Validate job ownership (AC: 8)
  - [ ] Verify authenticated user owns the job
  - [ ] Return 403 if unauthorized
  - [ ] Return 404 if job not found

## Dev Notes

- Use CreateUploadJobCommand and GetUploadJobStatusQuery
- Job status updates via domain events
- Progress calculation should be efficient
- Follow CQRS pattern

### Project Structure Notes

- Controller: `api/controllers/JobController.java`
- Command: `application/commands/CreateUploadJobCommand.java`
- Query: `application/queries/GetUploadJobStatusQuery.java`
- DTOs: `api/dto/CreateJobRequest.java`, `api/dto/JobStatusResponse.java`

### References

- [Source: docs/epics/epic-3-upload-api.md#Upload Job Management]
- [Source: docs/epics/epic-1-backend-core.md#UploadJob Aggregate]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

