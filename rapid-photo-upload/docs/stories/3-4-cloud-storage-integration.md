# Story 3.4: Cloud Storage Integration

Status: drafted

## Story

As a system,
I want to integrate with cloud storage (AWS S3 or Azure Blob),
so that photos are stored reliably and securely in the cloud.

## Acceptance Criteria

1. PhotoStorageService interface defined
2. S3PhotoStorageService implementation created
3. AzureBlobPhotoStorageService implementation created
4. uploadPhoto method implemented (streaming upload)
5. downloadPhoto method implemented
6. deletePhoto method implemented
7. generatePresignedUrl method implemented
8. Storage key generation: {userId}/{year}/{month}/{photoId}.{ext}
9. Progress listener for real-time updates
10. Non-blocking async processing

## Tasks / Subtasks

- [ ] Task 1: Define PhotoStorageService interface (AC: 1)
  - [ ] Create interface in infrastructure/storage/
  - [ ] Define uploadPhoto method signature
  - [ ] Define downloadPhoto method signature
  - [ ] Define deletePhoto method signature
  - [ ] Define generatePresignedUrl method signature
- [ ] Task 2: Implement S3PhotoStorageService (AC: 2)
  - [ ] Create S3PhotoStorageService class
  - [ ] Configure AWS S3 client
  - [ ] Implement all interface methods
  - [ ] Handle S3-specific errors
- [ ] Task 3: Implement AzureBlobPhotoStorageService (AC: 3)
  - [ ] Create AzureBlobPhotoStorageService class
  - [ ] Configure Azure Blob Storage client
  - [ ] Implement all interface methods
  - [ ] Handle Azure-specific errors
- [ ] Task 4: Implement uploadPhoto with streaming (AC: 4)
  - [ ] Stream file directly to cloud storage
  - [ ] No temporary files on server
  - [ ] Handle large files efficiently
  - [ ] Return storage key on success
- [ ] Task 5: Implement downloadPhoto (AC: 5)
  - [ ] Download photo from cloud storage
  - [ ] Return InputStream or byte array
  - [ ] Handle not found errors
- [ ] Task 6: Implement deletePhoto (AC: 6)
  - [ ] Delete photo from cloud storage
  - [ ] Handle deletion errors gracefully
  - [ ] Return success/failure status
- [ ] Task 7: Implement generatePresignedUrl (AC: 7)
  - [ ] Generate presigned URL for download
  - [ ] Set expiration (1 hour default)
  - [ ] Return secure URL
- [ ] Task 8: Implement storage key generation (AC: 8)
  - [ ] Generate key: {userId}/{year}/{month}/{photoId}.{ext}
  - [ ] Ensure user isolation
  - [ ] Prevent enumeration attacks
- [ ] Task 9: Add progress listener (AC: 9)
  - [ ] Create ProgressListener interface
  - [ ] Report upload progress percentage
  - [ ] Publish progress events
- [ ] Task 10: Ensure non-blocking async processing (AC: 10)
  - [ ] Use async/await or CompletableFuture
  - [ ] Don't block request threads
  - [ ] Handle errors asynchronously

## Dev Notes

- Use AWS S3 SDK or Azure Blob Storage SDK
- Storage service should be configurable (S3 or Azure)
- Progress events should be published via domain events
- Handle storage service unavailability gracefully

### Project Structure Notes

- Interface: `infrastructure/storage/PhotoStorageService.java`
- S3 Implementation: `infrastructure/storage/S3PhotoStorageService.java`
- Azure Implementation: `infrastructure/storage/AzureBlobPhotoStorageService.java`
- Config: `infrastructure/config/StorageConfig.java`
- Progress Listener: `infrastructure/storage/UploadProgressListener.java`

### References

- [Source: docs/epics/epic-3-upload-api.md#Cloud Storage Integration]
- [Source: docs/epics/epic-3-upload-api.md#Storage Key Generation]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

