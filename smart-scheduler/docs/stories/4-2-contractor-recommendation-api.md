# Story 4.2: Contractor Recommendation API

Status: drafted

## Story

As a dispatcher,
I want to get ranked contractor recommendations for a job,
so that I can quickly identify and assign the best available contractors.

## Acceptance Criteria

1. System accepts jobType, desiredDate, location as required inputs
2. System accepts duration (optional, default: 4 hours) and maxResults (optional, default: 10)
3. System returns only contractors matching job type
4. System returns only contractors with availability on desired date
5. System returns maximum 50 results regardless of maxResults parameter
6. System returns RankedContractor objects sorted by score (descending)
7. Each result includes: contractor details, score, score breakdown, available time slots
8. Response time: < 500ms
9. System handles no matches gracefully with empty array

## Tasks / Subtasks

- [ ] Task 1: Create Recommendation Query (AC: 1, 2, 3, 4, 5)
  - [ ] Create GetContractorRecommendationsQuery
  - [ ] Accept jobType, desiredDate, location, duration, maxResults
  - [ ] Filter contractors by job type
  - [ ] Filter contractors by availability
  - [ ] Limit results to maximum 50
- [ ] Task 2: Integrate Scoring Service (AC: 6, 7)
  - [ ] Use ScoringService from Story 4.1
  - [ ] Score all matching contractors
  - [ ] Sort by score descending
  - [ ] Include score breakdown in results
- [ ] Task 3: Include Availability Time Slots (AC: 7)
  - [ ] Use AvailabilityService to get time slots
  - [ ] Include available time slots in each result
  - [ ] Limit to slots matching job duration
- [ ] Task 4: Create RankedContractor DTO (AC: 7)
  - [ ] Create RankedContractorDto
  - [ ] Include contractor details
  - [ ] Include final score
  - [ ] Include ScoringDetails breakdown
  - [ ] Include available time slots
- [ ] Task 5: Optimize Query Performance (AC: 8)
  - [ ] Optimize database queries
  - [ ] Use efficient filtering
  - [ ] Batch availability calculations
  - [ ] Cache frequently accessed data
- [ ] Task 6: Create API Endpoint (AC: 1, 2, 8, 9)
  - [ ] Create POST /api/contractors/recommendations endpoint
  - [ ] Accept recommendation request DTO
  - [ ] Validate required inputs
  - [ ] Return ranked contractor list
  - [ ] Handle empty results gracefully
  - [ ] Ensure response time < 500ms
- [ ] Task 7: Write Unit Tests
  - [ ] Test job type filtering
  - [ ] Test availability filtering
  - [ ] Test result limiting
  - [ ] Test sorting by score
  - [ ] Test empty results handling
  - [ ] Test performance requirements

## Dev Notes

- Relevant architecture patterns and constraints
  - CQRS: Use Query pattern for recommendations
  - Performance: Optimize for sub-500ms response
  - Integration: Uses ScoringService and AvailabilityService
- Source tree components to touch
  - `backend/Queries/GetContractorRecommendationsQuery.cs`
  - `backend/Handlers/GetContractorRecommendationsHandler.cs`
  - `backend/DTOs/ContractorRecommendationRequestDto.cs`
  - `backend/DTOs/RankedContractorDto.cs`
  - `backend/Controllers/ContractorsController.cs`
- Testing standards summary
  - Unit tests for query handler
  - Integration tests for API endpoint
  - Test filtering and sorting
  - Performance tests for < 500ms requirement

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follow CQRS query pattern
  - Use DTOs for API requests/responses
- Detected conflicts or variances (with rationale)
  - Depends on Stories 4.1, 2.1, 2.2 - integrate existing services

### References

- [Source: docs/epics/epic-4-scoring-ranking-engine.md#FR-010]
- [Source: docs/API-Specification.md]
- [Source: docs/PRD-Master.md#Section-5.4]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

