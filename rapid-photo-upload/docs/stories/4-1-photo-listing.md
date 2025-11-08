# Story 4.1: Photo Listing with Pagination

Status: drafted

## Story

As a user,
I want to list my photos with pagination and filtering,
so that I can browse my photo collection efficiently.

## Acceptance Criteria

1. `GET /photos` endpoint implemented
2. Supports pagination (page, pageSize parameters)
3. Supports sorting (sortBy: uploadedAt, filename, size; sortOrder: asc, desc)
4. Supports tag filtering (tags parameter)
5. Supports status filtering (status parameter)
6. Returns paginated list of PhotoDTOs
7. Default pageSize: 50, max: 100
8. Validates user authorization
9. Performance target: < 500ms (p95)

## Tasks / Subtasks

- [ ] Task 1: Create photo listing endpoint (AC: 1)
  - [ ] Create GET /photos endpoint
  - [ ] Create ListPhotosQuery
  - [ ] Create ListPhotosQueryHandler
  - [ ] Create PhotoListResponse DTO
- [ ] Task 2: Implement pagination (AC: 2)
  - [ ] Accept page parameter (default: 0)
  - [ ] Accept pageSize parameter (default: 50, max: 100)
  - [ ] Calculate offset and limit
  - [ ] Return total count and page info
- [ ] Task 3: Implement sorting (AC: 3)
  - [ ] Accept sortBy parameter (uploadedAt, filename, size)
  - [ ] Accept sortOrder parameter (asc, desc)
  - [ ] Apply sorting to query
  - [ ] Default: uploadedAt desc
- [ ] Task 4: Implement tag filtering (AC: 4)
  - [ ] Accept tags parameter (comma-separated)
  - [ ] Filter photos by tags
  - [ ] Support multiple tags (AND logic)
  - [ ] Case-insensitive matching
- [ ] Task 5: Implement status filtering (AC: 5)
  - [ ] Accept status parameter
  - [ ] Filter by upload status
  - [ ] Support multiple statuses
- [ ] Task 6: Return paginated PhotoDTOs (AC: 6)
  - [ ] Map domain models to PhotoDTOs
  - [ ] Include all required fields
  - [ ] Return pagination metadata
- [ ] Task 7: Set default pagination (AC: 7)
  - [ ] Default pageSize: 50
  - [ ] Max pageSize: 100
  - [ ] Validate pageSize parameter
- [ ] Task 8: Validate authorization (AC: 8)
  - [ ] Filter by authenticated user
  - [ ] Return only user's photos
  - [ ] Return 401 if not authenticated
- [ ] Task 9: Optimize query performance (AC: 9)
  - [ ] Use indexed columns for sorting
  - [ ] Use materialized view if available
  - [ ] Add query optimization
  - [ ] Monitor query performance

## Dev Notes

- Use ListUserPhotosQuery
- Leverage materialized view for performance
- Index on user_id, uploaded_at, status
- Follow CQRS query pattern

### Project Structure Notes

- Controller: `api/controllers/PhotoController.java`
- Query: `application/queries/ListUserPhotosQuery.java`
- Handler: `application/queries/handlers/ListUserPhotosQueryHandler.java`
- DTO: `api/dto/PhotoListResponse.java`

### References

- [Source: docs/epics/epic-4-photo-query-api.md#Photo Listing]
- [Source: docs/epics/epic-4-photo-query-api.md#Pagination Strategy]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

