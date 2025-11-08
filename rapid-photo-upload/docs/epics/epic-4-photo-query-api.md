# Epic 4: Photo Query API

**Epic ID:** 4  
**Title:** Photo Query API  
**Description:** Gallery endpoints, pagination, filtering

## Overview

Implement query endpoints for retrieving photo metadata, listing user photos with pagination and filtering, and generating secure download URLs. This epic focuses on read-optimized queries using CQRS query handlers and materialized views.

## Photo Listing

### List User Photos
- `GET /photos` - List user's photos with pagination
- Query Parameters:
  - `page`: Integer (default: 0)
  - `pageSize`: Integer (default: 50, max: 100)
  - `sortBy`: uploadedAt, filename, size
  - `sortOrder`: asc, desc
  - `tags`: Comma-separated tag filters
  - `status`: Filter by upload status
- Response: Paginated list of PhotoDTOs

### Photo Metadata
- `GET /photos/{photoId}` - Get metadata for specific photo
- Returns: Complete PhotoDTO with all metadata
- Validates user owns the photo

## Photo DTO Structure

```json
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
```

## Download URLs

### Presigned URL Generation
- `GET /photos/{photoId}/download` - Get presigned download URL
- URLs expire after 1 hour
- Generated on-demand (not stored in database)
- Secure access to cloud storage

### Thumbnail URLs
- Thumbnail URLs included in PhotoDTO
- Presigned URLs with 1-hour expiration
- Generated on-demand

## Query Optimization

### Materialized View
- `photo_view` materialized view for optimized queries
- Includes aggregated tags
- Indexed on user_id, uploaded_at
- Refresh strategy: Triggered by domain events or scheduled

### Pagination Strategy
- Efficient LIMIT/OFFSET or cursor-based pagination
- Indexed columns for sorting (user_id, uploaded_at)
- Performance target: < 500ms (p95)

## Filtering & Sorting

### Tag Filtering
- Multi-tag filtering support
- Case-insensitive tag matching
- Efficient query with indexed tag table

### Sorting Options
- Upload date (default, descending)
- Filename (alphabetical)
- File size
- Ascending/descending order

### Status Filtering
- Filter by upload status: QUEUED, UPLOADING, COMPLETED, FAILED
- Useful for showing only completed photos in gallery

## Authorization

### Resource Access Control
- Users can only query their own photos
- Authorization check in QueryHandlers
- Return 403 Forbidden for unauthorized access
- Photo ownership verified on all queries

## Performance Requirements

- Photo metadata queries: < 200ms (p95)
- Photo list queries: < 500ms (p95)
- Presigned URL generation: < 100ms
- Efficient database queries using indexes
- Lazy loading support for large result sets

## Acceptance Criteria

- [ ] List photos endpoint with pagination
- [ ] Get photo metadata endpoint
- [ ] Download URL generation endpoint
- [ ] Tag filtering functional
- [ ] Sorting by date, filename, size
- [ ] Status filtering implemented
- [ ] Materialized view created and indexed
- [ ] Authorization checks in place
- [ ] Performance targets met
- [ ] Presigned URLs expire correctly

## Dependencies

- Epic 1: Backend Core (Photo aggregate, query handlers)
- Epic 2: Authentication & Authorization (user context)
- Epic 3: Upload API (photos must be uploaded first)
- Cloud storage SDK for presigned URLs

## Related Epics

- Epic 5: Real-Time Progress (query job status)
- Epic 8: Web Gallery UI (consumes query API)
- Epic 11: Mobile Gallery (consumes query API)

