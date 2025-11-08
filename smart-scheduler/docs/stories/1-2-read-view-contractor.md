# Story 1.2: Read/View Contractor

Status: drafted

## Story

As a dispatcher,
I want to view contractor details individually and in lists with filtering,
so that I can find and review contractor information for job assignments.

## Acceptance Criteria

1. System provides individual contractor view by ID
2. System provides list view with filtering and pagination
3. System supports search by name, type, location, and rating
4. System includes current availability status in contractor views
5. System shows job history and statistics for contractors

## Tasks / Subtasks

- [ ] Task 1: Create Contractor Query Models (AC: 1, 2, 3, 4, 5)
  - [ ] Create ContractorDetailDto for individual view
  - [ ] Create ContractorListItemDto for list view
  - [ ] Include availability status calculation
  - [ ] Include job history aggregation
- [ ] Task 2: Implement Get Contractor by ID Query (AC: 1, 4, 5)
  - [ ] Create GetContractorByIdQuery
  - [ ] Implement query handler with repository
  - [ ] Calculate availability status
  - [ ] Aggregate job history statistics
  - [ ] Return ContractorDetailDto
- [ ] Task 3: Implement List Contractors Query with Filtering (AC: 2, 3)
  - [ ] Create ListContractorsQuery with filter parameters
  - [ ] Implement filtering by name (fuzzy search)
  - [ ] Implement filtering by type
  - [ ] Implement filtering by location (proximity)
  - [ ] Implement filtering by rating (min/max)
  - [ ] Add pagination support
  - [ ] Return paginated ContractorListItemDto list
- [ ] Task 4: Create API Endpoints (AC: 1, 2)
  - [ ] Create GET /api/contractors/{id} endpoint
  - [ ] Create GET /api/contractors endpoint with query parameters
  - [ ] Handle not found errors
  - [ ] Return appropriate HTTP status codes
- [ ] Task 5: Write Unit Tests
  - [ ] Test individual contractor retrieval
  - [ ] Test filtering by each filter type
  - [ ] Test pagination
  - [ ] Test availability status calculation
  - [ ] Test job history aggregation

## Dev Notes

- Relevant architecture patterns and constraints
  - CQRS: Use Query pattern for reads
  - Pagination: Use offset/limit or cursor-based pagination
  - Search: Use PostgreSQL pg_trgm extension for fuzzy text search
  - Performance: Index on frequently filtered columns
- Source tree components to touch
  - `backend/Queries/GetContractorByIdQuery.cs`
  - `backend/Queries/ListContractorsQuery.cs`
  - `backend/Handlers/GetContractorByIdHandler.cs`
  - `backend/Handlers/ListContractorsHandler.cs`
  - `backend/DTOs/ContractorDetailDto.cs`
  - `backend/DTOs/ContractorListItemDto.cs`
  - `backend/Controllers/ContractorsController.cs`
- Testing standards summary
  - Unit tests for query handlers
  - Integration tests for API endpoints
  - Test filtering edge cases
  - Test pagination boundaries

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follow CQRS query pattern
  - Use DTOs for API responses
- Detected conflicts or variances (with rationale)
  - None identified

### References

- [Source: docs/epics/epic-1-contractor-management.md#FR-002]
- [Source: docs/Database-Schema.md#CONTRACTORS]
- [Source: docs/PRD-Master.md#Section-5.1]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

