# Story 3.5: Retry Failed Upload

Status: drafted

## Story

As a user,
I want to retry failed photo uploads,
so that transient failures don't prevent my photos from being uploaded.

## Acceptance Criteria

1. `POST /photos/{photoId}/retry` endpoint implemented
2. Validates photo belongs to authenticated user
3. Validates photo status is FAILED
4. Resets photo status to QUEUED
5. Re-initiates upload process
6. Returns success response
7. Returns 400 if photo not in FAILED status
8. Returns 403 if user doesn't own photo
9. Returns 404 if photo not found

## Tasks / Subtasks

- [ ] Task 1: Create retry endpoint (AC: 1)
  - [ ] Create POST /photos/{photoId}/retry endpoint
  - [ ] Create RetryUploadRequest DTO (optional)
  - [ ] Create RetryUploadResponse DTO
  - [ ] Map to RetryFailedUploadCommand
- [ ] Task 2: Validate photo ownership (AC: 2)
  - [ ] Load photo by photoId
  - [ ] Verify photo belongs to authenticated user
  - [ ] Return 403 if unauthorized
  - [ ] Return 404 if photo not found
- [ ] Task 3: Validate photo status (AC: 3)
  - [ ] Check photo status is FAILED
  - [ ] Return 400 if status is not FAILED
  - [ ] Provide clear error message
- [ ] Task 4: Reset photo status (AC: 4)
  - [ ] Update photo status to QUEUED
  - [ ] Clear any error messages
  - [ ] Reset retry count (if tracking)
  - [ ] Save photo to database
- [ ] Task 5: Re-initiate upload (AC: 5)
  - [ ] Publish PhotoUploadStarted event
  - [ ] Queue UploadPhotoCommand for processing
  - [ ] Associate with original job (if exists)
- [ ] Task 6: Return success response (AC: 6)
  - [ ] Return 200 OK
  - [ ] Return photoId
  - [ ] Return new status: QUEUED
  - [ ] Return message: "Upload retried successfully"
- [ ] Task 7: Handle invalid status error (AC: 7)
  - [ ] Return 400 Bad Request
  - [ ] Include error message: "Photo must be in FAILED status to retry"
- [ ] Task 8: Handle unauthorized error (AC: 8)
  - [ ] Return 403 Forbidden
  - [ ] Include error message: "You don't have permission to retry this upload"
- [ ] Task 9: Handle not found error (AC: 9)
  - [ ] Return 404 Not Found
  - [ ] Include error message: "Photo not found"

## Dev Notes

- Use RetryFailedUploadCommand
- Only allow retry for FAILED status
- Consider retry limit to prevent infinite loops
- Preserve original job association if exists

### Project Structure Notes

- Controller: `api/controllers/PhotoController.java`
- Command: `application/commands/RetryFailedUploadCommand.java`
- Handler: `application/commands/handlers/RetryFailedUploadCommandHandler.java`
- DTOs: `api/dto/RetryUploadResponse.java`

### References

- [Source: docs/epics/epic-3-upload-api.md#Retry Failed Upload]
- [Source: docs/epics/epic-3-upload-api.md#Error Handling]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

