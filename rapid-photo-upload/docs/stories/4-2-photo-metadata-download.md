# Story 4.2: Photo Metadata and Download URLs

Status: drafted

## Story

As a user,
I want to get detailed metadata for a specific photo and generate secure download URLs,
so that I can view photo details and download photos securely.

## Acceptance Criteria

1. `GET /photos/{photoId}` endpoint implemented
2. Returns complete PhotoDTO with all metadata
3. Validates user owns the photo
4. `GET /photos/{photoId}/download` endpoint implemented
5. Generates presigned download URL
6. URLs expire after 1 hour
7. Generated on-demand (not stored)
8. Secure access to cloud storage
9. Returns 403 if user doesn't own photo
10. Returns 404 if photo not found

## Tasks / Subtasks

- [ ] Task 1: Create photo metadata endpoint (AC: 1)
  - [ ] Create GET /photos/{photoId} endpoint
  - [ ] Create GetPhotoMetadataQuery
  - [ ] Create GetPhotoMetadataQueryHandler
  - [ ] Create PhotoMetadataResponse DTO
- [ ] Task 2: Return complete PhotoDTO (AC: 2)
  - [ ] Include photoId, filename, fileSize, contentType
  - [ ] Include status, thumbnailUrl, downloadUrl
  - [ ] Include tags, uploadedAt, dimensions
  - [ ] Include all metadata fields
- [ ] Task 3: Validate photo ownership (AC: 3)
  - [ ] Load photo by photoId
  - [ ] Verify photo belongs to authenticated user
  - [ ] Return 403 if unauthorized
  - [ ] Return 404 if photo not found
- [ ] Task 4: Create download URL endpoint (AC: 4)
  - [ ] Create GET /photos/{photoId}/download endpoint
  - [ ] Create GetDownloadUrlQuery
  - [ ] Create GetDownloadUrlQueryHandler
- [ ] Task 5: Generate presigned URL (AC: 5)
  - [ ] Use PhotoStorageService.generatePresignedUrl
  - [ ] Generate secure URL with signature
  - [ ] Return URL in response
- [ ] Task 6: Set URL expiration (AC: 6)
  - [ ] Set expiration to 1 hour
  - [ ] Include expiration in response
  - [ ] Document expiration behavior
- [ ] Task 7: Generate URLs on-demand (AC: 7)
  - [ ] Don't store URLs in database
  - [ ] Generate fresh URL each time
  - [ ] Ensure URLs are unique
- [ ] Task 8: Ensure secure access (AC: 8)
  - [ ] Verify user authorization before generating URL
  - [ ] Use presigned URLs with signatures
  - [ ] Validate URL signatures on access
- [ ] Task 9: Handle authorization errors (AC: 9)
  - [ ] Return 403 Forbidden
  - [ ] Include error message
- [ ] Task 10: Handle not found errors (AC: 10)
  - [ ] Return 404 Not Found
  - [ ] Include error message

## Dev Notes

- Use GetPhotoMetadataQuery and GetDownloadUrlQuery
- Presigned URLs should be secure and time-limited
- Don't cache presigned URLs
- Validate ownership before URL generation

### Project Structure Notes

- Controller: `api/controllers/PhotoController.java`
- Queries: `application/queries/GetPhotoMetadataQuery.java`, `application/queries/GetDownloadUrlQuery.java`
- Handlers: `application/queries/handlers/GetPhotoMetadataQueryHandler.java`, `application/queries/handlers/GetDownloadUrlQueryHandler.java`
- DTOs: `api/dto/PhotoMetadataResponse.java`, `api/dto/DownloadUrlResponse.java`

### References

- [Source: docs/epics/epic-4-photo-query-api.md#Photo Metadata]
- [Source: docs/epics/epic-4-photo-query-api.md#Download URLs]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

