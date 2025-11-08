# Story 3.3: Batch Photo Upload Endpoint

Status: drafted

## Story

As a user,
I want to upload multiple photos (up to 100) in a single request,
so that I can efficiently upload large batches of photos.

## Acceptance Criteria

1. `POST /photos/upload/batch` endpoint implemented
2. Accepts multipart/form-data with files[] parameter (max 100)
3. Accepts optional tags[] parameter
4. Validates all files (type, size)
5. Validates total count (max 100 files)
6. Validates user storage quota for all files
7. Returns 202 Accepted with jobId and photoIds
8. Processes up to 10 concurrent uploads
9. Creates upload job automatically
10. Queues all photos for async processing

## Tasks / Subtasks

- [ ] Task 1: Create batch upload endpoint (AC: 1)
  - [ ] Create POST /photos/upload/batch endpoint
  - [ ] Configure multipart file upload for multiple files
  - [ ] Create BatchUploadRequest DTO
  - [ ] Create BatchUploadResponse DTO
- [ ] Task 2: Accept multiple files (AC: 2)
  - [ ] Accept files[] parameter (MultipartFile[])
  - [ ] Extract all files from request
  - [ ] Validate at least one file provided
- [ ] Task 3: Accept optional tags (AC: 3)
  - [ ] Accept tags[] parameter (array)
  - [ ] Map tags to photos (if provided)
  - [ ] Validate tag format
- [ ] Task 4: Validate all files (AC: 4)
  - [ ] Validate file type for each file
  - [ ] Validate file size for each file (max 50MB each)
  - [ ] Return 400 with list of invalid files
- [ ] Task 5: Validate total count (AC: 5)
  - [ ] Count total files
  - [ ] Validate ≤ 100 files
  - [ ] Return 400 if exceeds limit
- [ ] Task 6: Validate total storage quota (AC: 6)
  - [ ] Calculate total size of all files
  - [ ] Check user's used storage + total size ≤ quota
  - [ ] Return 403 if quota exceeded
- [ ] Task 7: Return batch upload response (AC: 7)
  - [ ] Return jobId (created or provided)
  - [ ] Return array of photoIds
  - [ ] Return status: QUEUED for all photos
- [ ] Task 8: Process concurrent uploads (AC: 8)
  - [ ] Configure thread pool (10 concurrent uploads)
  - [ ] Queue uploads for processing
  - [ ] Process up to 10 simultaneously
- [ ] Task 9: Create upload job (AC: 9)
  - [ ] Create UploadJob aggregate
  - [ ] Set totalPhotos to file count
  - [ ] Associate all photos with job
  - [ ] Save job to database
- [ ] Task 10: Queue photos for processing (AC: 10)
  - [ ] Create Photo aggregates for all files
  - [ ] Set status to QUEUED
  - [ ] Associate with upload job
  - [ ] Publish PhotoUploadStarted events
  - [ ] Queue UploadPhotoCommands

## Dev Notes

- Use BatchUploadCommand
- Validate all files before processing any
- Create job first, then associate photos
- Use thread pool for concurrent processing
- Monitor concurrent upload limit

### Project Structure Notes

- Controller: `api/controllers/PhotoController.java`
- Command: `application/commands/BatchUploadCommand.java`
- Handler: `application/commands/handlers/BatchUploadCommandHandler.java`
- Thread Pool Config: `infrastructure/config/UploadThreadPoolConfig.java`
- DTOs: `api/dto/BatchUploadRequest.java`, `api/dto/BatchUploadResponse.java`

### References

- [Source: docs/epics/epic-3-upload-api.md#Batch Photo Upload]
- [Source: docs/epics/epic-3-upload-api.md#Concurrency Handling]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

