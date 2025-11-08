# rapid-photo-upload - Product Requirements Document

**Author:** Ryan
**Date:** 2025-11-08
**Version:** 1.0

---

## Executive Summary

RapidPhotoUpload is a high-performance, asynchronous photo upload system designed to handle up to 100 concurrent media uploads per user session without compromising user experience. The system demonstrates architectural excellence by implementing Domain-Driven Design (DDD), Command Query Responsibility Segregation (CQRS), and Vertical Slice Architecture (VSA) across a unified backend serving both web and mobile clients.

This project simulates real-world challenges faced by high-volume media platforms like Google Photos and Drive, where users expect seamless batch uploads while maintaining full application responsiveness. The system provides real-time upload progress tracking, efficient cloud storage integration, and a clean, scalable architecture suitable for production deployment.

### What Makes This Special

The magic of RapidPhotoUpload lies in making architectural complexity invisible to end users. While the system orchestrates intricate backend operations—managing 100 concurrent file streams, coordinating metadata persistence, interfacing with cloud object storage, and broadcasting real-time status updates—users experience nothing but smooth, responsive interfaces on both web and mobile platforms. This demonstrates that production-grade architectural patterns (DDD, CQRS, VSA) can deliver exceptional user experiences even under extreme concurrent load.

---

## Project Classification

**Technical Type:** Hybrid Multi-Platform System
- Mobile Application (React Native - iOS/Android)
- Web Application (React Native Web)
- Backend API (Java with Spring Boot)

**Domain:** General - High-Volume Media Platform
**Complexity:** High

This is a sophisticated multi-tier application that combines:
1. **Dual Frontend Architecture**: Shared React Native codebase serving both web and native mobile platforms
2. **Advanced Backend Patterns**: DDD for domain modeling, CQRS for command/query separation, VSA for feature-based organization
3. **Cloud-Native Integration**: Scalable object storage (AWS S3 or Azure Blob) with PostgreSQL for metadata persistence
4. **High-Concurrency Requirements**: Must handle 100 simultaneous uploads with sub-90-second completion time

The project challenges span across multiple technical domains:
- **Frontend Engineering**: Asynchronous UI state management, real-time progress visualization, cross-platform consistency
- **Backend Engineering**: Concurrent request handling, streaming file uploads, distributed system coordination
- **Cloud Architecture**: Object storage integration, database design, deployment strategy
- **Quality Engineering**: Integration testing across the full stack, load testing, performance validation

---

## Success Criteria

Success for RapidPhotoUpload is measured across three dimensions: **Performance**, **User Experience**, and **Architecture Quality**.

### Performance Benchmarks (MANDATORY)

1. **Concurrency Load**
   - MUST handle 100 concurrent photo uploads (avg 2MB each)
   - MUST complete within 90 seconds on standard broadband
   - Backend MUST not throttle or queue requests beyond acceptable limits
   - Cloud storage operations MUST complete reliably without timeouts

2. **UI Responsiveness**
   - Mobile and web interfaces MUST remain fluid during peak upload operations
   - Frame rate MUST NOT drop below 30 FPS during uploads
   - UI interactions MUST respond within 100ms during upload operations
   - No UI blocking or "freezing" perceivable to users

3. **Reliability**
   - Upload success rate MUST exceed 99% under normal conditions
   - Failed uploads MUST be clearly identified with actionable error messages
   - System MUST recover gracefully from transient network failures
   - Metadata consistency MUST be maintained across all operations

### User Experience Goals

1. **Transparency**
   - Users see real-time progress for individual files and batch operations
   - Clear status indicators: Queued → Uploading → Complete/Failed
   - Progress bars accurately reflect upload completion percentage
   - Users can continue browsing/tagging while uploads proceed in background

2. **Control**
   - Users can view upload queue and current operations
   - Clear error messaging with retry options for failed uploads
   - Ability to navigate away and return without losing upload state

3. **Cross-Platform Consistency**
   - Identical feature set and user experience on web and mobile
   - Consistent visual design and interaction patterns
   - Synchronized state when using both platforms

### Architecture Quality Indicators

1. **Pattern Implementation**
   - Clean DDD domain models with clear bounded contexts
   - CQRS separation demonstrable in codebase structure
   - VSA organization with feature-based slicing
   - Separation of Domain, Application, and Infrastructure layers

2. **Code Quality**
   - TypeScript strict mode compliance in frontend
   - Comprehensive integration tests validating end-to-end flows
   - Clear separation of concerns across all layers
   - Consistent naming conventions and modular design

3. **Production Readiness**
   - Deployable to AWS or Azure with documented process
   - Environment configuration management
   - Error handling and logging throughout
   - Security best practices implemented

### Business Metrics

While this is an assessment project, production deployment would track:

- **Daily Active Users (DAU)** uploading photos
- **Average Photos Per Upload Session** (target: 20-50)
- **Upload Success Rate** (target: >99%)
- **User Retention** (users who return to upload again)
- **Average Time to Upload Batch** (target: <90s for 100 photos)
- **Cross-Platform Usage** (web vs mobile distribution)

---

## Product Scope

### MVP - Minimum Viable Product

The MVP delivers the core assessment requirements with production-quality implementation:

#### Backend (Java Spring Boot)

**Upload Management**
- Accept and process up to 100 concurrent file uploads per session
- Stream uploaded files directly to cloud object storage (S3 or Azure Blob)
- Persist photo metadata to PostgreSQL database
- Implement retry logic for transient failures
- Return real-time status updates via WebSocket or Server-Sent Events

**Domain Model (DDD)**
- `Photo` aggregate: ID, filename, size, upload status, cloud storage key, metadata
- `UploadJob` aggregate: batch ID, photos collection, overall status, progress
- `User` aggregate: user ID, authentication credentials, upload history
- Domain services for upload orchestration and validation

**CQRS Implementation**
- **Commands**: UploadPhoto, RetryFailedUpload, CancelUpload
- **Queries**: GetPhotoMetadata, GetUploadJobStatus, ListUserPhotos
- Clear separation between command handlers and query handlers

**Vertical Slice Architecture**
- `UploadPhotoSlice`: All logic for photo upload command
- `GetPhotoMetadataSlice`: All logic for photo retrieval
- `ListPhotosSlice`: All logic for photo listing
- Each slice contains: controller, command/query, handler, repository

**Infrastructure**
- Cloud storage integration (AWS S3 SDK or Azure Blob Storage SDK)
- PostgreSQL repository implementations
- JWT-based authentication or mock authentication
- API endpoint routing and error handling

#### Web Frontend (React Native Web + TypeScript)

**Photo Upload Interface**
- Multi-file selection from local file system
- Drag-and-drop upload zone
- Real-time progress bars for individual files
- Batch progress indicator
- Status badges: Queued, Uploading (%), Complete, Failed

**Photo Gallery**
- Grid view of uploaded photos with thumbnails
- Photo metadata display (filename, size, upload date)
- Download capability for uploaded photos
- Basic tagging interface (add/view tags per photo)

**Upload Queue Management**
- Visible upload queue showing all in-progress uploads
- Per-file progress tracking
- Failed upload identification with retry button
- Cancel upload capability (stretch goal)

**Asynchronous UI**
- Non-blocking UI during upload operations
- Ability to navigate between pages while uploads continue
- Upload status persists across page navigation
- Background upload notifications

#### Mobile Frontend (React Native + TypeScript)

**Photo Upload Interface**
- Access device photo library
- Multi-photo selection (up to 100)
- Camera integration for direct photo capture
- Real-time progress indicators
- Upload status notifications

**Photo Gallery**
- Scrollable grid of uploaded photos
- Thumbnail lazy loading
- Photo detail view with metadata
- Download to device capability
- Tag management interface

**Background Upload Support**
- Uploads continue when app is backgrounded (iOS/Android)
- Push notifications for upload completion/failure
- Resume interrupted uploads on app reactivation

**Platform-Specific Features**
- iOS: Photos framework integration, native file picker
- Android: Storage permissions, native gallery access

#### Shared Capabilities (Web + Mobile)

**Authentication**
- Login screen (JWT-based or mocked)
- Session persistence
- Secure token storage
- Logout functionality

**Error Handling**
- Network error detection and user feedback
- Server error messages displayed clearly
- Retry mechanism for failed uploads
- Graceful degradation when offline

**State Management**
- Centralized state management (Redux, MobX, or Zustand)
- Upload progress state synchronized with backend
- Optimistic UI updates with rollback on failure

### Growth Features (Post-MVP)

Features to enhance the platform after core functionality is proven:

**Advanced Upload Management**
- **Pause/Resume Uploads**: Allow users to pause uploads and resume later
- **Upload Prioritization**: Users can reorder upload queue
- **Bandwidth Throttling**: Limit upload speed to preserve bandwidth
- **Selective Retry**: Retry only failed uploads from a batch
- **Chunked Uploads**: Break large files into chunks for reliability
- **Deduplication**: Detect and skip duplicate photos already uploaded

**Enhanced Photo Management**
- **Photo Editing**: Basic cropping, rotation, filters before upload
- **Bulk Tagging**: Apply tags to multiple photos simultaneously
- **Photo Organization**: Albums, folders, smart collections
- **Advanced Search**: Search by tags, date, filename, metadata
- **Sharing**: Generate shareable links, set permissions
- **Photo Deletion**: Remove photos from storage

**Collaboration Features**
- **Shared Albums**: Multiple users contribute to same collection
- **Comments**: Add comments to photos
- **Permissions**: View, edit, upload, delete access levels
- **Activity Feed**: See recent uploads and activity by collaborators

**Performance Enhancements**
- **Image Compression**: Client-side compression before upload
- **Adaptive Quality**: Adjust compression based on bandwidth
- **Smart Caching**: Cache thumbnails and metadata locally
- **Progressive Image Loading**: Show low-res preview while loading full image

**Analytics & Insights**
- **Upload Analytics Dashboard**: Track upload patterns, success rates
- **Storage Usage Visualization**: Show storage consumption over time
- **Performance Metrics**: Monitor upload speeds, completion times
- **User Behavior Insights**: Most active users, popular features

**AI-Powered Features** (Optional AI Tool Integration)
- **Auto-Tagging**: Automatically tag photos based on content (AI image recognition)
- **Smart Compression**: AI-optimized compression algorithms
- **Upload Prioritization Logic**: AI suggests priority based on photo content
- **Content Moderation**: Detect and flag inappropriate content

### Vision (Future)

Long-term vision for the platform:

**Enterprise Features**
- Organization accounts with team management
- SSO integration (SAML, OAuth)
- Advanced RBAC with custom roles
- Audit logs and compliance reporting
- White-label deployment options

**Advanced Cloud Integration**
- Multi-cloud support (AWS + Azure simultaneously)
- Geo-distributed storage for global performance
- CDN integration for faster global delivery
- Cold storage archival for cost optimization
- Automated backup and disaster recovery

**Platform Expansion**
- Video upload support with transcoding
- Document management (PDFs, Office files)
- 3D model/file support
- Live photo/motion photo support

**Machine Learning Integration**
- Facial recognition for auto-grouping
- Scene detection and categorization
- Duplicate detection with smart merging
- Quality assessment and auto-enhancement
- Predictive upload suggestions

**Developer Platform**
- Public API for third-party integrations
- Webhooks for upload events
- SDK for common languages (Python, JavaScript, Go)
- Developer portal with documentation
- Rate limiting and API key management

---

## Hybrid Multi-Platform System Specific Requirements

This section provides exceptional technical detail for the development team to implement the backend API, web frontend, and mobile frontend components.

### Backend API Requirements (Java Spring Boot)

#### Architecture Patterns Implementation

##### Domain-Driven Design (DDD) - Domain Layer

**Aggregates and Entities**

1. **Photo Aggregate**
   ```
   Photo (Aggregate Root)
   ├── PhotoId (Value Object): UUID, immutable
   ├── Filename (Value Object): original filename, validation rules
   ├── FileSize (Value Object): bytes, must be > 0
   ├── ContentType (Value Object): MIME type (image/jpeg, image/png, etc.)
   ├── UploadStatus (Enum): QUEUED, UPLOADING, COMPLETED, FAILED, CANCELLED
   ├── StorageKey (Value Object): S3/Azure blob storage path
   ├── ThumbnailStorageKey (Value Object): Optional thumbnail path
   ├── UploadedAt (Value Object): ISO 8601 timestamp
   ├── UploadedBy (Value Object): User reference
   ├── Metadata (Entity Collection):
   │   ├── Tags (List<String>)
   │   ├── OriginalDimensions (Width, Height)
   │   ├── FileHash (SHA-256 for deduplication)
   │   └── CustomProperties (Map<String, String>)
   └── DomainEvents:
       ├── PhotoUploadStarted
       ├── PhotoUploadProgressed (percentage)
       ├── PhotoUploadCompleted
       └── PhotoUploadFailed (error details)
   ```

   **Invariants:**
   - Photo cannot transition from COMPLETED to UPLOADING
   - StorageKey must be set when status is COMPLETED
   - FileSize must match actual stored file size
   - ContentType must be valid image MIME type

   **Methods:**
   - `markAsUploading()`: Transition to UPLOADING state
   - `completeUpload(storageKey, fileHash)`: Mark upload complete
   - `markAsFailed(errorMessage)`: Handle failure
   - `addTag(tag)`: Add metadata tag
   - `updateProgress(percentage)`: Update upload progress

2. **UploadJob Aggregate**
   ```
   UploadJob (Aggregate Root)
   ├── JobId (Value Object): UUID
   ├── UserId (Value Object): Reference to User
   ├── Photos (Collection<PhotoId>): References to Photo aggregates
   ├── TotalPhotos (Value Object): Integer count
   ├── CompletedPhotos (Value Object): Integer count
   ├── FailedPhotos (Value Object): Integer count
   ├── JobStatus (Enum): CREATED, IN_PROGRESS, COMPLETED, PARTIALLY_FAILED, FAILED
   ├── CreatedAt (Value Object): ISO 8601 timestamp
   ├── CompletedAt (Value Object): Optional ISO 8601 timestamp
   ├── OverallProgress (Calculated): (Completed + Failed) / Total * 100
   └── DomainEvents:
       ├── UploadJobCreated
       ├── UploadJobProgressed
       ├── UploadJobCompleted
       └── UploadJobFailed
   ```

   **Methods:**
   - `addPhoto(photoId)`: Add photo to job
   - `recordPhotoCompletion(photoId)`: Increment completed count
   - `recordPhotoFailure(photoId, error)`: Increment failed count
   - `calculateProgress()`: Return overall percentage
   - `canComplete()`: Check if all photos processed

3. **User Aggregate**
   ```
   User (Aggregate Root)
   ├── UserId (Value Object): UUID
   ├── Username (Value Object): Unique, 3-50 chars
   ├── Email (Value Object): Validated email format
   ├── PasswordHash (Value Object): Bcrypt hashed
   ├── Roles (Collection<Role>): USER, ADMIN
   ├── StorageQuota (Value Object): Maximum bytes allowed
   ├── UsedStorage (Value Object): Current bytes used
   ├── CreatedAt (Value Object): ISO 8601 timestamp
   ├── LastLoginAt (Value Object): ISO 8601 timestamp
   └── DomainEvents:
       ├── UserRegistered
       ├── UserLoggedIn
       └── StorageQuotaExceeded
   ```

   **Methods:**
   - `authenticate(password)`: Verify password
   - `incrementStorage(bytes)`: Update used storage
   - `decrementStorage(bytes)`: Update on deletion
   - `hasStorageAvailable(bytes)`: Check quota

**Domain Services**

1. **UploadOrchestrationService**
   - Coordinates multi-photo upload job creation
   - Validates storage quota before accepting uploads
   - Assigns photos to upload workers
   - Publishes domain events for UI updates

2. **PhotoStorageService** (Infrastructure boundary)
   - Interface for cloud storage operations
   - Implementations: `S3PhotoStorageService`, `AzureBlobPhotoStorageService`
   - Methods:
     - `uploadPhoto(stream, metadata): StorageKey`
     - `downloadPhoto(storageKey): Stream`
     - `deletePhoto(storageKey): void`
     - `generatePresignedUrl(storageKey, expirationTime): URL`

3. **PhotoHashingService**
   - Calculate SHA-256 hash for deduplication
   - Detect duplicate uploads within same user's storage

##### CQRS Implementation - Application Layer

**Command Side**

1. **UploadPhotoCommand**
   ```
   UploadPhotoCommand {
     JobId: UUID (optional, creates new if not provided)
     UserId: UUID
     FileName: String
     FileSize: Long
     ContentType: String
     FileStream: InputStream
     Tags: List<String> (optional)
   }
   ```

   **Handler: UploadPhotoCommandHandler**
   - Validate user storage quota
   - Create or retrieve UploadJob aggregate
   - Create Photo aggregate
   - Stream file to cloud storage (non-blocking)
   - Persist Photo entity to database
   - Publish PhotoUploadStarted event
   - Return: `CommandResult<PhotoId, StorageKey>`

   **Validation Rules:**
   - File size <= 50MB per photo
   - Content type must be image/*
   - User must have sufficient quota
   - Maximum 100 photos per job

   **Error Scenarios:**
   - `QuotaExceededException`: User storage limit reached
   - `InvalidFileTypeException`: Non-image file
   - `FileTooLargeException`: Exceeds 50MB
   - `StorageServiceUnavailableException`: Cloud storage unreachable

2. **RetryFailedUploadCommand**
   ```
   RetryFailedUploadCommand {
     PhotoId: UUID
     UserId: UUID
   }
   ```

   **Handler: RetryFailedUploadCommandHandler**
   - Load Photo aggregate
   - Verify photo belongs to user
   - Verify status is FAILED
   - Reset status to QUEUED
   - Re-initiate upload process
   - Return: `CommandResult<PhotoId>`

3. **CreateUploadJobCommand**
   ```
   CreateUploadJobCommand {
     UserId: UUID
     PhotoCount: Integer
   }
   ```

   **Handler: CreateUploadJobCommandHandler**
   - Validate photoCount <= 100
   - Create UploadJob aggregate
   - Persist to database
   - Return: `CommandResult<JobId>`

**Query Side**

1. **GetPhotoMetadataQuery**
   ```
   GetPhotoMetadataQuery {
     PhotoId: UUID
     UserId: UUID (for authorization)
   }
   ```

   **Handler: GetPhotoMetadataQueryHandler**
   - Retrieve from read-optimized photo_view table
   - Include: filename, size, upload date, tags, download URL
   - Return: `PhotoDTO`

   **PhotoDTO Structure:**
   ```
   PhotoDTO {
     Id: UUID
     Filename: String
     FileSize: Long
     ContentType: String
     UploadStatus: String
     ThumbnailUrl: String (presigned URL, 1-hour expiration)
     DownloadUrl: String (presigned URL, 1-hour expiration)
     Tags: List<String>
     UploadedAt: ISO8601 String
     Dimensions: { width: Integer, height: Integer }
   }
   ```

2. **GetUploadJobStatusQuery**
   ```
   GetUploadJobStatusQuery {
     JobId: UUID
     UserId: UUID
   }
   ```

   **Handler: GetUploadJobStatusQueryHandler**
   - Retrieve job with aggregated photo statuses
   - Calculate real-time progress percentage
   - Return: `UploadJobDTO`

   **UploadJobDTO Structure:**
   ```
   UploadJobDTO {
     JobId: UUID
     Status: String
     TotalPhotos: Integer
     CompletedPhotos: Integer
     FailedPhotos: Integer
     InProgressPhotos: Integer
     OverallProgress: Double (0.0 - 100.0)
     CreatedAt: ISO8601 String
     Photos: List<PhotoDTO>
   }
   ```

3. **ListUserPhotosQuery**
   ```
   ListUserPhotosQuery {
     UserId: UUID
     Page: Integer (default: 0)
     PageSize: Integer (default: 50, max: 100)
     SortBy: String (uploadedAt, filename, size)
     SortOrder: String (asc, desc)
     FilterByTags: List<String> (optional)
   }
   ```

   **Handler: ListUserPhotosQueryHandler**
   - Query read-optimized view with pagination
   - Apply tag filters if provided
   - Return: `PagedResult<PhotoDTO>`

##### Vertical Slice Architecture - Feature Organization

**Directory Structure**
```
src/main/java/com/rapidphotoupload/
├── domain/
│   ├── model/
│   │   ├── Photo.java
│   │   ├── UploadJob.java
│   │   └── User.java
│   ├── valueobjects/
│   │   ├── PhotoId.java
│   │   ├── StorageKey.java
│   │   └── UploadStatus.java
│   ├── events/
│   │   ├── PhotoUploadStarted.java
│   │   ├── PhotoUploadCompleted.java
│   │   └── UploadJobCompleted.java
│   └── services/
│       ├── UploadOrchestrationService.java
│       └── PhotoStorageService.java (interface)
│
├── application/
│   ├── commands/
│   │   ├── UploadPhotoCommand.java
│   │   ├── UploadPhotoCommandHandler.java
│   │   ├── RetryFailedUploadCommand.java
│   │   └── RetryFailedUploadCommandHandler.java
│   ├── queries/
│   │   ├── GetPhotoMetadataQuery.java
│   │   ├── GetPhotoMetadataQueryHandler.java
│   │   ├── GetUploadJobStatusQuery.java
│   │   └── GetUploadJobStatusQueryHandler.java
│   └── dto/
│       ├── PhotoDTO.java
│       └── UploadJobDTO.java
│
├── features/ (Vertical Slices)
│   ├── uploadphoto/
│   │   ├── UploadPhotoController.java
│   │   ├── UploadPhotoEndpoint.java
│   │   ├── UploadPhotoValidator.java
│   │   └── UploadPhotoIntegrationTest.java
│   │
│   ├── getphotometadata/
│   │   ├── GetPhotoMetadataController.java
│   │   ├── GetPhotoMetadataEndpoint.java
│   │   └── GetPhotoMetadataIntegrationTest.java
│   │
│   ├── listphotos/
│   │   ├── ListPhotosController.java
│   │   ├── ListPhotosEndpoint.java
│   │   ├── PhotoFilterBuilder.java
│   │   └── ListPhotosIntegrationTest.java
│   │
│   └── retryfailedupload/
│       ├── RetryFailedUploadController.java
│       └── RetryFailedUploadEndpoint.java
│
├── infrastructure/
│   ├── persistence/
│   │   ├── PhotoRepository.java
│   │   ├── UploadJobRepository.java
│   │   ├── UserRepository.java
│   │   └── jpa/
│   │       ├── JpaPhotoRepository.java
│   │       └── PhotoEntity.java
│   │
│   ├── storage/
│   │   ├── S3PhotoStorageService.java
│   │   ├── AzureBlobPhotoStorageService.java
│   │   └── StorageConfiguration.java
│   │
│   ├── messaging/
│   │   ├── WebSocketUploadProgressPublisher.java
│   │   └── SSEUploadProgressPublisher.java
│   │
│   └── security/
│       ├── JwtTokenProvider.java
│       └── SecurityConfiguration.java
│
└── api/
    ├── rest/
    │   ├── PhotoUploadRestController.java
    │   ├── PhotoQueryRestController.java
    │   └── AuthenticationRestController.java
    │
    └── websocket/
        └── UploadProgressWebSocketHandler.java
```

**Slice Example: Upload Photo Slice**

Each slice is self-contained with all layers needed for that feature:

```java
// UploadPhotoController.java
@RestController
@RequestMapping("/api/v1/photos")
public class UploadPhotoController {

    private final UploadPhotoCommandHandler commandHandler;
    private final UploadOrchestrationService orchestrationService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoUploadResponse> uploadPhoto(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "jobId", required = false) UUID jobId,
        @RequestParam(value = "tags", required = false) List<String> tags,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Validation
        if (file.getSize() > 50_000_000) { // 50MB
            throw new FileTooLargeException("Maximum file size is 50MB");
        }

        // Create command
        UploadPhotoCommand command = UploadPhotoCommand.builder()
            .jobId(jobId)
            .userId(UUID.fromString(userDetails.getUsername()))
            .fileName(file.getOriginalFilename())
            .fileSize(file.getSize())
            .contentType(file.getContentType())
            .fileStream(file.getInputStream())
            .tags(tags)
            .build();

        // Execute command (asynchronous)
        CompletableFuture<CommandResult> result = commandHandler.handleAsync(command);

        // Return immediate response with job tracking info
        return ResponseEntity.accepted()
            .body(new PhotoUploadResponse(result.getPhotoId(), result.getJobId()));
    }
}
```

#### API Endpoint Specification

**Base URL:** `https://teamfront-rapid-photo-upload-archlife.us-west-1.elasticbeanstalk.com`

**Authentication:** JWT Bearer Token in `Authorization` header

##### 1. Authentication Endpoints

**POST /auth/register**
- **Description:** Register new user
- **Request Body:**
  ```json
  {
    "username": "string (3-50 chars)",
    "email": "string (valid email)",
    "password": "string (min 8 chars, complexity requirements)"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "createdAt": "ISO8601"
  }
  ```
- **Errors:**
  - `400 Bad Request`: Validation failure
  - `409 Conflict`: Username/email already exists

**POST /auth/login**
- **Description:** Authenticate and receive JWT
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "accessToken": "string (JWT)",
    "refreshToken": "string",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
  ```
- **Errors:**
  - `401 Unauthorized`: Invalid credentials

**POST /auth/refresh**
- **Description:** Refresh access token
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response:** `200 OK` (same as login)

##### 2. Upload Job Endpoints

**POST /jobs**
- **Description:** Create a new upload job
- **Request Body:**
  ```json
  {
    "photoCount": 100
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "jobId": "uuid",
    "userId": "uuid",
    "status": "CREATED",
    "totalPhotos": 100,
    "createdAt": "ISO8601"
  }
  ```

**GET /jobs/{jobId}**
- **Description:** Get upload job status with all photo details
- **Response:** `200 OK`
  ```json
  {
    "jobId": "uuid",
    "status": "IN_PROGRESS",
    "totalPhotos": 100,
    "completedPhotos": 73,
    "failedPhotos": 2,
    "inProgressPhotos": 25,
    "overallProgress": 75.0,
    "createdAt": "ISO8601",
    "photos": [
      {
        "photoId": "uuid",
        "filename": "vacation-001.jpg",
        "status": "COMPLETED",
        "progress": 100,
        "uploadedAt": "ISO8601"
      }
    ]
  }
  ```

##### 3. Photo Upload Endpoints

**POST /photos/upload**
- **Description:** Upload a single photo (part of a job)
- **Content-Type:** `multipart/form-data`
- **Request Parameters:**
  - `file`: Binary file data (required)
  - `jobId`: UUID (optional, creates new job if not provided)
  - `tags`: Array of strings (optional)
- **Response:** `202 Accepted`
  ```json
  {
    "photoId": "uuid",
    "jobId": "uuid",
    "status": "QUEUED",
    "message": "Upload initiated"
  }
  ```
- **Errors:**
  - `400 Bad Request`: Invalid file type, file too large
  - `403 Forbidden`: Storage quota exceeded
  - `413 Payload Too Large`: File > 50MB

**POST /photos/upload/batch**
- **Description:** Initiate batch upload of multiple photos
- **Content-Type:** `multipart/form-data`
- **Request Parameters:**
  - `files[]`: Array of files (max 100)
  - `tags[]`: Optional tags to apply to all
- **Response:** `202 Accepted`
  ```json
  {
    "jobId": "uuid",
    "totalPhotos": 100,
    "photoIds": ["uuid1", "uuid2", ...],
    "status": "IN_PROGRESS"
  }
  ```
- **Implementation Notes:**
  - Backend spawns up to 10 concurrent upload threads
  - Files streamed directly to S3/Azure without temp storage
  - WebSocket events published for each photo status change

**POST /photos/{photoId}/retry**
- **Description:** Retry a failed upload
- **Response:** `202 Accepted`
  ```json
  {
    "photoId": "uuid",
    "status": "QUEUED",
    "message": "Retry initiated"
  }
  ```

##### 4. Photo Query Endpoints

**GET /photos**
- **Description:** List user's photos with pagination and filtering
- **Query Parameters:**
  - `page`: Integer (default: 0)
  - `pageSize`: Integer (default: 50, max: 100)
  - `sortBy`: String (uploadedAt, filename, size)
  - `sortOrder`: String (asc, desc)
  - `tags`: Comma-separated tag filters
  - `status`: Filter by upload status
- **Response:** `200 OK`
  ```json
  {
    "photos": [
      {
        "photoId": "uuid",
        "filename": "photo.jpg",
        "fileSize": 2048576,
        "contentType": "image/jpeg",
        "status": "COMPLETED",
        "thumbnailUrl": "https://cdn.../thumb.jpg",
        "downloadUrl": "https://s3.../photo.jpg?signature=...",
        "tags": ["vacation", "beach"],
        "uploadedAt": "ISO8601",
        "dimensions": { "width": 1920, "height": 1080 }
      }
    ],
    "pagination": {
      "page": 0,
      "pageSize": 50,
      "totalPages": 3,
      "totalElements": 137
    }
  }
  ```

**GET /photos/{photoId}**
- **Description:** Get metadata for specific photo
- **Response:** `200 OK` (single PhotoDTO as above)

**GET /photos/{photoId}/download**
- **Description:** Get presigned download URL
- **Response:** `200 OK`
  ```json
  {
    "downloadUrl": "https://s3.../photo.jpg?signature=...",
    "expiresAt": "ISO8601",
    "expiresIn": 3600
  }
  ```

**DELETE /photos/{photoId}**
- **Description:** Delete photo from storage
- **Response:** `204 No Content`

##### 5. Photo Tagging Endpoints

**POST /photos/{photoId}/tags**
- **Description:** Add tags to photo
- **Request Body:**
  ```json
  {
    "tags": ["vacation", "2024", "beach"]
  }
  ```
- **Response:** `200 OK`

**DELETE /photos/{photoId}/tags/{tag}**
- **Description:** Remove tag from photo
- **Response:** `204 No Content`

##### 6. Real-Time Progress Endpoints

**WebSocket: /ws/upload-progress**
- **Description:** WebSocket connection for real-time upload progress
- **Authentication:** JWT token in connection query param: `?token=...`
- **Subscribe:** `/topic/jobs/{jobId}`
- **Message Format:**
  ```json
  {
    "type": "PROGRESS_UPDATE",
    "jobId": "uuid",
    "photoId": "uuid",
    "status": "UPLOADING",
    "progress": 67,
    "timestamp": "ISO8601"
  }
  ```

**Alternative: Server-Sent Events (SSE)**
- **GET /events/upload-progress/{jobId}**
- **Description:** SSE stream for job progress
- **Response:** `text/event-stream`
  ```
  data: {"jobId": "...", "photoId": "...", "status": "COMPLETED", "progress": 100}
  ```

#### Database Schema (PostgreSQL)

**users table**
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    storage_quota BIGINT DEFAULT 10737418240, -- 10GB in bytes
    used_storage BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_storage CHECK (used_storage <= storage_quota)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

**upload_jobs table**
```sql
CREATE TABLE upload_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    total_photos INTEGER NOT NULL,
    completed_photos INTEGER DEFAULT 0,
    failed_photos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_job_status CHECK (status IN ('CREATED', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_FAILED', 'FAILED'))
);

CREATE INDEX idx_jobs_user ON upload_jobs(user_id);
CREATE INDEX idx_jobs_status ON upload_jobs(status);
CREATE INDEX idx_jobs_created ON upload_jobs(created_at DESC);
```

**photos table**
```sql
CREATE TABLE photos (
    photo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES upload_jobs(job_id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    storage_key VARCHAR(500) UNIQUE,
    thumbnail_storage_key VARCHAR(500),
    file_hash VARCHAR(64), -- SHA-256
    upload_status VARCHAR(20) NOT NULL,
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_photo_status CHECK (upload_status IN ('QUEUED', 'UPLOADING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

CREATE INDEX idx_photos_user ON photos(user_id);
CREATE INDEX idx_photos_job ON photos(job_id);
CREATE INDEX idx_photos_status ON photos(upload_status);
CREATE INDEX idx_photos_uploaded ON photos(uploaded_at DESC);
CREATE INDEX idx_photos_hash ON photos(file_hash) WHERE file_hash IS NOT NULL;
```

**photo_tags table** (many-to-many)
```sql
CREATE TABLE photo_tags (
    photo_id UUID REFERENCES photos(photo_id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (photo_id, tag)
);

CREATE INDEX idx_tags_tag ON photo_tags(tag);
```

**photo_view (Materialized View for Query Optimization)**
```sql
CREATE MATERIALIZED VIEW photo_view AS
SELECT
    p.photo_id,
    p.user_id,
    p.filename,
    p.file_size,
    p.content_type,
    p.storage_key,
    p.thumbnail_storage_key,
    p.upload_status,
    p.width,
    p.height,
    p.uploaded_at,
    ARRAY_AGG(pt.tag) FILTER (WHERE pt.tag IS NOT NULL) AS tags
FROM photos p
LEFT JOIN photo_tags pt ON p.photo_id = pt.photo_id
GROUP BY p.photo_id;

CREATE UNIQUE INDEX idx_photo_view_id ON photo_view(photo_id);
CREATE INDEX idx_photo_view_user ON photo_view(user_id);
CREATE INDEX idx_photo_view_uploaded ON photo_view(uploaded_at DESC);

-- Refresh strategy: Triggered by domain events or scheduled refresh
```

#### Concurrency Handling Strategy

**Thread Pool Configuration**
```java
@Configuration
public class AsyncConfiguration implements AsyncConfigurer {

    @Bean(name = "photoUploadExecutor")
    public Executor photoUploadExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("photo-upload-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

**Upload Processing Flow**
1. Client initiates batch upload → Creates UploadJob
2. Each file upload POST → Queued in upload_jobs
3. UploadPhotoCommandHandler executes asynchronously using @Async
4. Up to 10 concurrent uploads processed simultaneously
5. Each upload:
   - Reads file stream
   - Streams directly to S3/Azure (no temp file)
   - Publishes progress events via WebSocket
   - Updates database on completion
6. Job completes when all photos processed

**Streaming Upload Implementation**
```java
@Service
public class S3PhotoStorageService implements PhotoStorageService {

    private final AmazonS3 s3Client;

    @Override
    public StorageKey uploadPhoto(InputStream stream, PhotoMetadata metadata) {
        String key = generateStorageKey(metadata.getUserId(), metadata.getPhotoId());

        ObjectMetadata s3Metadata = new ObjectMetadata();
        s3Metadata.setContentLength(metadata.getFileSize());
        s3Metadata.setContentType(metadata.getContentType());

        // Stream directly to S3 without buffering entire file
        PutObjectRequest request = new PutObjectRequest(
            bucketName,
            key,
            stream,
            s3Metadata
        );

        // Add progress listener for real-time updates
        request.setGeneralProgressListener(progressEvent -> {
            double progress = (progressEvent.getBytesTransferred() / (double) metadata.getFileSize()) * 100;
            publishProgressEvent(metadata.getPhotoId(), progress);
        });

        s3Client.putObject(request);

        return new StorageKey(key);
    }
}
```

**Rate Limiting**
```java
@Component
public class UploadRateLimiter {

    private final RateLimiter rateLimiter = RateLimiter.create(100.0); // 100 uploads/sec

    public void acquirePermit() {
        rateLimiter.acquire();
    }
}
```

#### Authentication & Authorization Model

**JWT Token Structure**
```json
{
  "sub": "user-uuid",
  "username": "john_doe",
  "roles": ["USER"],
  "iat": 1699564800,
  "exp": 1699568400
}
```

**Token Generation**
```java
@Service
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration; // 3600 seconds (1 hour)

    public String generateToken(User user) {
        Claims claims = Jwts.claims().setSubject(user.getUserId().toString());
        claims.put("username", user.getUsername());
        claims.put("roles", user.getRoles());

        Date now = new Date();
        Date validity = new Date(now.getTime() + expiration * 1000);

        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(SignatureAlgorithm.HS256, secret)
            .compact();
    }
}
```

**Security Configuration**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
                .antMatchers("/api/v1/auth/**").permitAll()
                .antMatchers("/api/v1/**").authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    }
}
```

**Resource-Level Authorization**
- Users can only access their own photos and jobs
- Implemented in CommandHandlers and QueryHandlers
- Check `userId` in request matches authenticated user

#### Cloud Storage Integration

**AWS S3 Configuration**
```yaml
# application.yml
cloud:
  storage:
    provider: s3 # or azure
    s3:
      bucket-name: rapidphotoupload-photos
      region: us-east-1
      access-key: ${AWS_ACCESS_KEY}
      secret-key: ${AWS_SECRET_KEY}
    azure:
      storage-account: ${AZURE_STORAGE_ACCOUNT}
      container-name: photos
      access-key: ${AZURE_STORAGE_KEY}
```

**Storage Key Generation**
```
Pattern: {userId}/{year}/{month}/{photoId}.{ext}
Example: 123e4567-e89b-12d3-a456-426614174000/2025/11/photo-uuid.jpg
```

**Presigned URLs**
- Download URLs expire after 1 hour
- Thumbnail URLs expire after 1 hour
- Generated on-demand in query handlers
- Not stored in database

---

### Web Frontend Requirements (React Native Web + TypeScript)

The web frontend must deliver exceptional performance and user experience while handling high-volume concurrent uploads. This section provides complete technical specifications for the development team.

####  Technology Stack Summary

- React Native Web 0.19+ with TypeScript 5.0+ strict mode
- Zustand or Redux Toolkit for global state
- React Query (TanStack Query) for server state
- Socket.io or WebSocket for real-time progress
- React Dropzone for drag-and-drop uploads
- Axios with interceptors for API communication

#### Key Implementation Requirements

**Upload Flow**
1. Drag-and-drop or click-to-select file interface
2. Client-side validation (file type, size, count)
3. Thumbnail preview generation using createObjectURL
4. Concurrent upload processing (max 10 simultaneous)
5. Real-time progress tracking via WebSocket
6. Retry mechanism for failed uploads
7. Upload queue persistence across page navigation

**Photo Gallery**
1. Infinite scroll with pagination
2. Virtualized list for performance (1000+ photos)
3. Lazy image loading with placeholders
4. Grid layout (responsive columns)
5. Tag-based filtering
6. Sort by date, name, size
7. Photo detail modal with metadata display

**State Management Architecture**
- Upload state: queue, progress tracking, statistics
- Auth state: user, tokens, authentication status
- UI state: modals, loading states, errors
- Server state: photo queries, upload jobs (React Query)

**Error Handling**
- Global error boundary for React errors
- Axios response interceptors for API errors
- User-friendly error messages with retry options
- Network disconnection detection and notification
- Form validation with clear field-level errors

---

### Mobile Frontend Requirements (React Native + TypeScript)

The mobile application mirrors web functionality while leveraging native platform capabilities for optimal mobile user experience.

#### Platform-Specific Features

**iOS Implementation**
1. Photo library access via `@react-native-camera-roll/camera-roll`
2. Camera integration with `react-native-vision-camera`
3. Background upload using Background Fetch API
4. Local push notifications for upload completion
5. HEIC to JPEG conversion for compatibility
6. App Store compliance (privacy labels, permissions)

**Android Implementation**
1. Photo picker with scoped storage (Android 10+)
2. Camera2 API integration
3. Foreground service for persistent uploads
4. WorkManager for reliable background tasks
5. FCM for push notifications
6. Runtime permission handling (Android 6.0+)

**Shared Mobile Features**
1. Bottom sheet UI for upload queue
2. Swipe gestures (delete, retry)
3. Pull-to-refresh in gallery
4. Offline queue persistence with AsyncStorage
5. Network status monitoring with NetInfo
6. Haptic feedback for user actions
7. Native navigation with React Navigation

**Background Upload Strategy**
1. Queue uploads locally when app backgrounded
2. Resume uploads on app foreground
3. Show persistent notification with progress
4. Handle network disconnection gracefully
5. Retry failed uploads automatically

---

## User Experience Principles

### Visual Design Guidelines

**Design System**
- **Color Palette**:
  - Primary: Blue (#4299e1) for actions and progress
  - Success: Green (#48bb78) for completed states
  - Error: Red (#f56565) for failures
  - Warning: Orange (#ed8936) for warnings
  - Neutral: Gray scale for text and backgrounds

- **Typography**:
  - Headings: 18-24px, font-weight 600-700
  - Body: 14-16px, font-weight 400-500
  - Captions: 12-13px, font-weight 400

- **Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48)
- **Border Radius**: 4px (small), 8px (medium), 12px (large)
- **Shadows**: Subtle elevation for cards and modals

**Component Patterns**
- Cards: Photo thumbnails, upload queue items
- Progress bars: Linear (upload progress), Circular (batch progress)
- Buttons: Primary (upload), Secondary (cancel), Ghost (clear)
- Badges: Status indicators (uploading, completed, failed)
- Modals: Photo detail view, confirmation dialogs
- Toast notifications: Success, error, info messages

### Interaction Patterns

**Upload Experience**
1. User selects/drags files → Immediate visual feedback
2. Files added to queue → Thumbnail previews generated
3. User clicks "Upload" → Batch progress indicator appears
4. Individual progress bars update in real-time
5. Completed uploads fade out or move to "Completed" section
6. Failed uploads show error with "Retry" button
7. User can navigate away - uploads continue in background

**Gallery Experience**
1. Grid loads with skeleton placeholders
2. Images lazy-load as user scrolls
3. Click photo → Fullscreen modal with metadata
4. Pinch-to-zoom on mobile (optional)
5. Tag filtering with multi-select dropdown
6. Search by filename (debounced input)
7. Sort options in dropdown menu

**Responsiveness Requirements**
- Mobile: Single column, touch-optimized (min 44x44px tap targets)
- Tablet: 2-3 column grid, hybrid touch/mouse
- Desktop: 3-5 column grid, drag-and-drop enabled
- All viewports: Fluid layouts, no horizontal scroll

---

## Functional Requirements

### Complete Feature Breakdown

#### 1. User Authentication & Authorization

**Registration**
- FR-AUTH-001: Users SHALL register with username (3-50 chars), email, and password (min 8 chars)
- FR-AUTH-002: System SHALL validate email format and uniqueness
- FR-AUTH-003: System SHALL hash passwords using bcrypt before storage
- FR-AUTH-004: System SHALL send email verification (growth feature)

**Login**
- FR-AUTH-005: Users SHALL authenticate with username/email and password
- FR-AUTH-006: System SHALL return JWT access token (1-hour expiration) and refresh token
- FR-AUTH-007: System SHALL support "Remember Me" for extended sessions
- FR-AUTH-008: Web and mobile clients SHALL store tokens securely

**Session Management**
- FR-AUTH-009: System SHALL refresh access tokens using refresh tokens
- FR-AUTH-010: System SHALL invalidate tokens on logout
- FR-AUTH-011: System SHALL enforce single session per user (optional)

**Authorization**
- FR-AUTH-012: Users SHALL only access their own photos and upload jobs
- FR-AUTH-013: System SHALL validate resource ownership on all requests
- FR-AUTH-014: Admin users SHALL have access to all resources (future)

#### 2. Photo Upload Management

**Job Creation**
- FR-UPLOAD-001: System SHALL create UploadJob when batch upload initiated
- FR-UPLOAD-002: Each UploadJob SHALL have unique UUID identifier
- FR-UPLOAD-003: UploadJob SHALL track total, completed, and failed photo counts
- FR-UPLOAD-004: UploadJob SHALL calculate overall progress percentage

**File Selection (Web)**
- FR-UPLOAD-005: Web client SHALL support drag-and-drop file selection
- FR-UPLOAD-006: Web client SHALL support click-to-browse file selection
- FR-UPLOAD-007: Client SHALL allow selecting up to 100 files per job
- FR-UPLOAD-008: Client SHALL display thumbnail previews immediately

**File Selection (Mobile)**
- FR-UPLOAD-009: Mobile client SHALL access device photo library
- FR-UPLOAD-010: Mobile client SHALL support camera capture
- FR-UPLOAD-011: Mobile client SHALL allow multi-selection (up to 100)
- FR-UPLOAD-012: Mobile client SHALL handle HEIC/HEIF formats

**File Validation**
- FR-UPLOAD-013: Client SHALL validate file type (image/jpeg, image/png, image/gif, image/webp)
- FR-UPLOAD-014: Client SHALL validate file size (max 50MB per file)
- FR-UPLOAD-015: Client SHALL validate total count (max 100 files per job)
- FR-UPLOAD-016: Client SHALL display clear error messages for rejected files

**Upload Execution**
- FR-UPLOAD-017: System SHALL process up to 10 uploads concurrently
- FR-UPLOAD-018: System SHALL stream files directly to cloud storage (no temp files)
- FR-UPLOAD-019: System SHALL generate SHA-256 hash for each file
- FR-UPLOAD-020: System SHALL extract image dimensions (width, height)
- FR-UPLOAD-021: System SHALL persist photo metadata to database

**Progress Tracking**
- FR-UPLOAD-022: System SHALL publish real-time progress events via WebSocket
- FR-UPLOAD-023: Client SHALL display individual file progress (0-100%)
- FR-UPLOAD-024: Client SHALL display batch overall progress
- FR-UPLOAD-025: Client SHALL show status badges (Queued, Uploading, Completed, Failed)

**Error Handling**
- FR-UPLOAD-026: System SHALL identify and report failed uploads
- FR-UPLOAD-027: Client SHALL provide "Retry" button for failed uploads
- FR-UPLOAD-028: System SHALL support retry mechanism for transient failures
- FR-UPLOAD-029: Client SHALL display specific error messages (quota exceeded, file too large, etc.)

**Background Upload (Mobile)**
- FR-UPLOAD-030: Mobile client SHALL continue uploads when app backgrounded
- FR-UPLOAD-031: Mobile client SHALL show notification during background upload
- FR-UPLOAD-032: Mobile client SHALL resume uploads on app foregrounding
- FR-UPLOAD-033: Mobile client SHALL persist upload queue locally

#### 3. Photo Gallery & Viewing

**Photo Listing**
- FR-GALLERY-001: System SHALL return paginated photo lists (default 50, max 100 per page)
- FR-GALLERY-002: Client SHALL implement infinite scroll pagination
- FR-GALLERY-003: Client SHALL display photos in responsive grid layout
- FR-GALLERY-004: Client SHALL lazy-load images for performance

**Photo Display**
- FR-GALLERY-005: System SHALL provide thumbnail URLs (presigned, 1-hour expiration)
- FR-GALLERY-006: System SHALL provide download URLs (presigned, 1-hour expiration)
- FR-GALLERY-007: Client SHALL display photo metadata (filename, size, date, tags)
- FR-GALLERY-008: Client SHALL display upload status badge

**Sorting & Filtering**
- FR-GALLERY-009: Client SHALL support sorting by upload date (default), filename, size
- FR-GALLERY-010: Client SHALL support ascending/descending sort order
- FR-GALLERY-011: Client SHALL support filtering by tags (multi-select)
- FR-GALLERY-012: Client SHALL support filtering by upload status

**Photo Detail View**
- FR-GALLERY-013: Client SHALL display fullscreen photo view on click/tap
- FR-GALLERY-014: Modal SHALL show complete metadata (dimensions, size, hash, tags)
- FR-GALLERY-015: Modal SHALL provide download button
- FR-GALLERY-016: Modal SHALL provide delete button (with confirmation)

**Photo Download**
- FR-GALLERY-017: System SHALL generate secure presigned download URL on request
- FR-GALLERY-018: Download SHALL retrieve original photo from cloud storage
- FR-GALLERY-019: Downloaded file SHALL retain original filename

**Photo Deletion**
- FR-GALLERY-020: User SHALL confirm deletion before executing
- FR-GALLERY-021: System SHALL delete photo from cloud storage
- FR-GALLERY-022: System SHALL delete photo metadata from database
- FR-GALLERY-023: System SHALL update user's storage usage

#### 4. Photo Tagging & Organization

**Tag Management**
- FR-TAG-001: Users SHALL add tags to individual photos
- FR-TAG-002: Users SHALL add tags to multiple photos (bulk tagging - growth)
- FR-TAG-003: Tags SHALL be case-insensitive strings (max 50 chars)
- FR-TAG-004: System SHALL store tags in separate table (many-to-many)
- FR-TAG-005: Client SHALL provide tag autocomplete based on user's existing tags

**Tag Display**
- FR-TAG-006: Client SHALL display tags as badges on photo cards
- FR-TAG-007: Client SHALL support clicking tag to filter by that tag
- FR-TAG-008: Client SHALL show tag count next to each tag

**Tag Removal**
- FR-TAG-009: Users SHALL remove tags from individual photos
- FR-TAG-010: Removing tag SHALL not affect other photos with same tag

#### 5. Storage Quota Management

**Quota Enforcement**
- FR-QUOTA-001: Each user SHALL have default storage quota (10GB)
- FR-QUOTA-002: System SHALL track used storage per user
- FR-QUOTA-003: System SHALL reject uploads exceeding quota
- FR-QUOTA-004: Client SHALL display quota usage (used / total)
- FR-QUOTA-005: Client SHALL warn when approaching quota limit (90%)

**Quota Updates**
- FR-QUOTA-006: System SHALL increment used storage on upload completion
- FR-QUOTA-007: System SHALL decrement used storage on photo deletion
- FR-QUOTA-008: System SHALL ensure quota integrity with database constraints

---

## Non-Functional Requirements

### Performance Requirements

**NFR-PERF-001: Upload Concurrency**
- System MUST handle 100 concurrent photo uploads per user session
- Backend MUST process up to 10 uploads simultaneously per user
- Upload processing time MUST NOT exceed 90 seconds for 100 x 2MB photos on standard broadband (10 Mbps upload)

**NFR-PERF-002: UI Responsiveness**
- Web and mobile UIs MUST remain responsive during peak upload operations
- Frame rate MUST NOT drop below 30 FPS during uploads
- UI interactions (clicks, scrolls) MUST respond within 100ms
- No perceivable UI blocking or freezing

**NFR-PERF-003: API Response Times**
- Authentication endpoints: < 500ms (p95)
- Photo metadata queries: < 200ms (p95)
- Photo list queries: < 500ms (p95)
- Upload initiation: < 300ms (p95)

**NFR-PERF-004: Database Performance**
- Photo queries MUST use indexed columns (user_id, uploaded_at)
- Pagination MUST use efficient LIMIT/OFFSET or cursor-based approach
- Materialized view refresh MUST complete within 5 seconds

**NFR-PERF-005: Cloud Storage Performance**
- S3/Azure upload streams MUST NOT buffer entire file in memory
- Presigned URL generation MUST complete within 100ms
- Download requests MUST stream efficiently without timeouts

**NFR-PERF-006: Frontend Performance**
- Initial page load: < 3 seconds (p95)
- Photo grid rendering: < 500ms for 50 photos
- Infinite scroll fetch: < 1 second
- Image lazy loading: visible within 200ms of entering viewport

### Security Requirements

**NFR-SEC-001: Authentication Security**
- Passwords MUST be hashed using bcrypt (cost factor ≥ 10)
- JWT tokens MUST be signed using HS256 or RS256
- Access tokens MUST expire within 1 hour
- Refresh tokens MUST expire within 7 days
- Tokens MUST be invalidated on logout

**NFR-SEC-002: Authorization**
- All API endpoints MUST validate JWT in Authorization header
- System MUST verify user owns requested resource
- Failed authorization MUST return 403 Forbidden
- System MUST log authorization failures

**NFR-SEC-003: Data Protection**
- Database connections MUST use SSL/TLS
- S3/Azure connections MUST use HTTPS
- Sensitive data (passwords, tokens) MUST NOT be logged
- API responses MUST NOT expose internal errors to clients

**NFR-SEC-004: Input Validation**
- All user inputs MUST be validated server-side
- File uploads MUST validate content type and size
- SQL injection MUST be prevented using parameterized queries
- XSS MUST be prevented by sanitizing user-generated content

**NFR-SEC-005: Cloud Storage Security**
- S3 bucket MUST have private ACL (no public access)
- Presigned URLs MUST expire within 1 hour
- Storage keys MUST include user ID to prevent enumeration
- CORS MUST be configured to allow only known origins

### Scalability Requirements

**NFR-SCALE-001: Horizontal Scaling**
- Backend MUST be stateless to support horizontal scaling
- WebSocket connections MUST support clustering (sticky sessions or Redis adapter)
- Database connection pool MUST be configurable per instance

**NFR-SCALE-002: Storage Scalability**
- Cloud storage MUST support unlimited file count
- S3/Azure MUST handle 1000+ concurrent uploads globally
- Database MUST partition photos table if exceeds 10M rows

**NFR-SCALE-003: Traffic Handling**
- System MUST handle 1000+ concurrent users
- API MUST support rate limiting (100 requests/min per user)
- WebSocket server MUST handle 10,000+ concurrent connections

### Reliability Requirements

**NFR-REL-001: Upload Reliability**
- Upload success rate MUST exceed 99% under normal conditions
- System MUST detect and report transient network failures
- Failed uploads MUST be retryable without data loss

**NFR-REL-002: Data Integrity**
- Photo metadata MUST match stored file
- Database MUST enforce referential integrity (foreign keys)
- Storage quota calculations MUST be accurate and consistent

**NFR-REL-003: Error Recovery**
- System MUST recover from transient failures automatically
- WebSocket disconnections MUST reconnect with exponential backoff
- Database connection failures MUST retry with connection pool

**NFR-REL-004: Monitoring & Logging**
- System MUST log all errors with stack traces
- System MUST monitor upload success/failure rates
- System MUST alert on abnormal error rates (> 5%)
- Logs MUST include request IDs for tracing

### Usability Requirements

**NFR-USE-001: Error Messages**
- Error messages MUST be user-friendly and actionable
- Technical details MUST be hidden from end users
- Errors MUST suggest corrective actions (e.g., "Retry", "Check connection")

**NFR-USE-002: Loading States**
- All asynchronous operations MUST show loading indicators
- Upload progress MUST be clearly visible
- Skeleton loaders MUST be used for content placeholders

**NFR-USE-003: Accessibility (Growth)**
- Web client SHOULD meet WCAG 2.1 Level AA standards
- UI SHOULD support keyboard navigation
- Images SHOULD have alt text descriptions
- Color contrast SHOULD meet accessibility guidelines

**NFR-USE-004: Responsive Design**
- Web client MUST support desktop (1920x1080), tablet (768x1024), mobile (375x667)
- Mobile client MUST support portrait and landscape orientations
- Touch targets MUST be minimum 44x44 pixels (iOS HIG, Android Material Design)

### Maintainability Requirements

**NFR-MAINT-001: Code Quality**
- TypeScript strict mode MUST be enabled
- Code coverage MUST exceed 70% for critical paths
- Linting rules MUST be enforced (ESLint, Prettier)
- No compiler warnings or errors allowed

**NFR-MAINT-002: Documentation**
- All public APIs MUST have JSDoc/Javadoc comments
- README MUST include setup instructions
- Architecture decisions MUST be documented (ADRs)

**NFR-MAINT-003: Testing**
- Unit tests for business logic (services, handlers)
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Tests MUST run in CI/CD pipeline

---

## Testing Requirements

### Integration Testing (Mandatory)

**Test Scope**
Integration tests MUST validate the complete end-to-end upload flow:
1. Client (simulated web/mobile) → Backend API → Cloud Storage → Database

**Required Test Cases**

**TC-INT-001: Successful Single Photo Upload**
- Given: Authenticated user, valid 2MB JPEG file
- When: Upload via POST /photos/upload
- Then: Photo stored in S3/Azure, metadata in database, status = COMPLETED

**TC-INT-002: Successful Batch Upload (100 Photos)**
- Given: Authenticated user, 100 valid image files
- When: Upload via POST /photos/upload/batch
- Then: All 100 photos stored, job status = COMPLETED, progress = 100%

**TC-INT-003: Failed Upload (File Too Large)**
- Given: Authenticated user, 60MB file
- When: Upload via POST /photos/upload
- Then: Upload rejected, error code 413, no storage/database changes

**TC-INT-004: Failed Upload (Invalid File Type)**
- Given: Authenticated user, PDF file
- When: Upload via POST /photos/upload
- Then: Upload rejected, error code 400, clear error message

**TC-INT-005: Upload with Storage Quota Exceeded**
- Given: User with 9.9GB used storage, 10GB quota, 200MB file
- When: Upload via POST /photos/upload
- Then: Upload rejected, error code 403, quota exceeded message

**TC-INT-006: Photo Retrieval and Download**
- Given: Completed upload (photo in storage + database)
- When: GET /photos/{photoId}/download
- Then: Presigned URL returned, file downloadable, matches original

**TC-INT-007: Upload Progress Tracking via WebSocket**
- Given: Active WebSocket connection, upload in progress
- When: Upload proceeds
- Then: Progress events received (0% → 100%), final status = COMPLETED

**TC-INT-008: Concurrent Upload Handling**
- Given: 10 simultaneous upload requests
- When: All uploads proceed
- Then: All complete successfully, no race conditions, data consistent

**Test Tools**
- **Backend**: JUnit 5 + Spring Boot Test + Testcontainers (PostgreSQL + LocalStack S3)
- **Frontend**: Jest + React Testing Library + MSW (Mock Service Worker)
- **E2E**: Cypress or Playwright

---

## Implementation Planning

### Epic Breakdown Required

This PRD contains comprehensive requirements for a multi-tier application. The next step is to decompose these requirements into epics and user stories optimized for 200k context development agents.

**Recommended Epic Structure:**
1. **Epic 1: Backend Core** - Domain models, CQRS, VSA setup
2. **Epic 2: Authentication & Authorization** - JWT, user management
3. **Epic 3: Upload API** - Upload endpoints, job management, cloud storage integration
4. **Epic 4: Photo Query API** - Gallery endpoints, pagination, filtering
5. **Epic 5: Real-Time Progress** - WebSocket implementation, event publishing
6. **Epic 6: Web Frontend Core** - React setup, routing, state management
7. **Epic 7: Web Upload UI** - Drag-drop, queue management, progress tracking
8. **Epic 8: Web Gallery UI** - Photo grid, infinite scroll, detail view
9. **Epic 9: Mobile Frontend Core** - React Native setup, navigation
10. **Epic 10: Mobile Upload** - Photo picker, camera, background upload
11. **Epic 11: Mobile Gallery** - Native photo grid, swipe gestures
12. **Epic 12: Testing & Deployment** - Integration tests, CI/CD, cloud deployment

**Next Step:** Run `workflow create-epics-and-stories` to create the implementation breakdown.

---

## References

- **Source Document:** /Users/zernach/code/teamfront/rapid-photo-upload/docs/instructions.md
- **Product Type:** Hybrid Multi-Platform System (Mobile + Web + API)
- **Domain:** General - High-Volume Media Platform
- **Architectural Patterns:** DDD, CQRS, Vertical Slice Architecture

---

## Next Steps

1. **Epic & Story Breakdown** - Run: `workflow create-epics-and-stories`
2. **Architecture Design** - Run: `workflow architecture`
3. **UX Design** (if needed) - Run: `workflow create-ux-design`

---

_This PRD captures the complete technical vision for rapid-photo-upload - a production-grade high-concurrency photo upload system showcasing modern architectural patterns and exceptional user experience across web and mobile platforms._

_Created through systematic requirements discovery and technical analysis by the BMad Business Analyst workflow._

