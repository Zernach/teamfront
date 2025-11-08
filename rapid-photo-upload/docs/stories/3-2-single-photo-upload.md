# Story 3.2: Single Photo Upload Endpoint

Status: drafted

## Story

As a user,
I want to upload a single photo,
so that I can add photos to my collection one at a time.

## Acceptance Criteria

1. `POST /photos/upload` endpoint implemented
2. Accepts multipart/form-data with file parameter
3. Accepts optional jobId parameter
4. Accepts optional tags parameter
5. Validates file type (images only)
6. Validates file size (max 50MB)
7. Validates user storage quota
8. Returns 202 Accepted with photoId and jobId
9. Queues photo for async upload processing
10. Validates user authorization

## Tasks / Subtasks

- [ ] Task 1: Create single photo upload endpoint (AC: 1)
  - [ ] Create PhotoController with POST /photos/upload
  - [ ] Configure multipart file upload
  - [ ] Create UploadPhotoRequest DTO
  - [ ] Create UploadPhotoResponse DTO
- [ ] Task 2: Accept multipart file (AC: 2)
  - [ ] Accept file parameter (MultipartFile)
  - [ ] Extract file from request
  - [ ] Validate file is present
- [ ] Task 3: Accept optional parameters (AC: 3, 4)
  - [ ] Accept optional jobId parameter
  - [ ] Accept optional tags parameter (array)
  - [ ] Validate jobId exists and belongs to user
- [ ] Task 4: Validate file type (AC: 5)
  - [ ] Check Content-Type: image/jpeg, image/png, image/gif, image/webp
  - [ ] Return 400 if invalid file type
  - [ ] Provide clear error message
- [ ] Task 5: Validate file size (AC: 6)
  - [ ] Check file size ≤ 50MB
  - [ ] Return 413 Payload Too Large if exceeds limit
  - [ ] Provide clear error message
- [ ] Task 6: Validate storage quota (AC: 7)
  - [ ] Check user's used storage + file size ≤ quota
  - [ ] Return 403 Forbidden if quota exceeded
  - [ ] Provide clear error message
- [ ] Task 7: Return 202 Accepted response (AC: 8)
  - [ ] Return photoId (UUID)
  - [ ] Return jobId (if provided or created)
  - [ ] Return status: QUEUED
- [ ] Task 8: Queue photo for async processing (AC: 9)
  - [ ] Create Photo aggregate with QUEUED status
  - [ ] Save photo to database
  - [ ] Publish PhotoUploadStarted event
  - [ ] Queue UploadPhotoCommand for async processing
- [ ] Task 9: Validate user authorization (AC: 10)
  - [ ] Verify authenticated user
  - [ ] Associate photo with user
  - [ ] Return 401 if not authenticated

## Dev Notes

- Use UploadPhotoCommand for async processing
- File validation should happen before queuing
- Quota check must be atomic
- Follow async processing pattern

### Project Structure Notes

- Controller: `api/controllers/PhotoController.java`
- Command: `application/commands/UploadPhotoCommand.java`
- Handler: `application/commands/handlers/UploadPhotoCommandHandler.java`
- DTOs: `api/dto/UploadPhotoRequest.java`, `api/dto/UploadPhotoResponse.java`

### References

- [Source: docs/epics/epic-3-upload-api.md#Photo Upload Endpoints]
- [Source: docs/epics/epic-3-upload-api.md#File Validation]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

