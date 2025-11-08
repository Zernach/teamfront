# Epic 3: Upload API

**Epic ID:** 3  
**Title:** Upload API  
**Description:** Upload endpoints, job management, cloud storage integration

## Overview

Implement the core photo upload functionality including batch upload job management, file streaming to cloud storage, concurrent upload processing, and upload status tracking. This epic handles the high-concurrency requirements (100 concurrent uploads) and integrates with AWS S3 or Azure Blob Storage.

## Upload Job Management

### Job Creation
- `POST /jobs` - Create new upload job
- Request: photoCount (max 100)
- Response: JobId, status, totalPhotos, createdAt
- Job tracks overall progress and status

### Job Status Retrieval
- `GET /jobs/{jobId}` - Get upload job status
- Returns: Job status, progress, photo list with individual statuses
- Real-time progress calculation

## Photo Upload Endpoints

### Single Photo Upload
- `POST /photos/upload` - Upload single photo
- Content-Type: multipart/form-data
- Parameters: file (required), jobId (optional), tags (optional)
- Response: 202 Accepted with photoId and jobId
- Validates: file type, size (max 50MB), user quota

### Batch Photo Upload
- `POST /photos/upload/batch` - Upload multiple photos
- Content-Type: multipart/form-data
- Parameters: files[] (max 100), tags[] (optional)
- Response: 202 Accepted with jobId and photoIds
- Processes up to 10 concurrent uploads

### Retry Failed Upload
- `POST /photos/{photoId}/retry` - Retry failed upload
- Validates photo belongs to user and status is FAILED
- Resets status to QUEUED and re-initiates upload

## Cloud Storage Integration

### Storage Service Interface
- `PhotoStorageService` interface
- Implementations: `S3PhotoStorageService`, `AzureBlobPhotoStorageService`
- Methods: uploadPhoto, downloadPhoto, deletePhoto, generatePresignedUrl

### Storage Key Generation
- Pattern: `{userId}/{year}/{month}/{photoId}.{ext}`
- Ensures user isolation and prevents enumeration

### Streaming Upload
- Stream files directly to cloud storage (no temp files)
- Progress listener for real-time updates
- Non-blocking async processing

## Concurrency Handling

### Thread Pool Configuration
- Core pool size: 10 threads
- Max pool size: 50 threads
- Queue capacity: 500
- Rejected execution handler: CallerRunsPolicy

### Upload Processing Flow
1. Client initiates batch upload → Creates UploadJob
2. Each file upload POST → Queued
3. UploadPhotoCommandHandler executes asynchronously
4. Up to 10 concurrent uploads processed simultaneously
5. Each upload streams to cloud storage
6. Progress events published via WebSocket
7. Database updated on completion

### Rate Limiting
- Rate limiter: 100 uploads/second
- Prevents system overload

## File Validation

### Client-Side Validation
- File type: image/jpeg, image/png, image/gif, image/webp
- File size: max 50MB per file
- Total count: max 100 files per job

### Server-Side Validation
- Content type validation
- File size validation
- Storage quota check
- User authorization check

## Error Handling

### Error Scenarios
- `QuotaExceededException`: User storage limit reached
- `InvalidFileTypeException`: Non-image file
- `FileTooLargeException`: Exceeds 50MB
- `StorageServiceUnavailableException`: Cloud storage unreachable

### Error Responses
- 400 Bad Request: Invalid file type, file too large
- 403 Forbidden: Storage quota exceeded
- 413 Payload Too Large: File > 50MB
- 500 Internal Server Error: Storage service unavailable

## Domain Events

### Photo Upload Events
- PhotoUploadStarted
- PhotoUploadProgressed (percentage)
- PhotoUploadCompleted
- PhotoUploadFailed (error details)

### Job Events
- UploadJobCreated
- UploadJobProgressed
- UploadJobCompleted
- UploadJobFailed

## Acceptance Criteria

- [ ] Upload job creation endpoint implemented
- [ ] Single photo upload endpoint functional
- [ ] Batch upload endpoint handles 100 photos
- [ ] Cloud storage integration (S3 or Azure) working
- [ ] Concurrent upload processing (10 simultaneous)
- [ ] File validation (type, size, quota)
- [ ] Retry mechanism for failed uploads
- [ ] Progress tracking via domain events
- [ ] Error handling with appropriate status codes
- [ ] Storage quota enforcement

## Dependencies

- Epic 1: Backend Core (Photo and UploadJob aggregates)
- Epic 2: Authentication & Authorization (user authentication)
- AWS S3 SDK or Azure Blob Storage SDK
- Spring Boot async support

## Related Epics

- Epic 4: Photo Query API (queries uploaded photos)
- Epic 5: Real-Time Progress (WebSocket events)
- Epic 7: Web Upload UI (client interface)
- Epic 10: Mobile Upload (mobile client interface)

