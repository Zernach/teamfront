# Story 2.1: Calculate Contractor Availability

Status: drafted

## Story

As a dispatcher,
I want to accurately determine contractor availability,
so that I can identify which contractors are available for job assignments at specific times.

## Acceptance Criteria

1. System considers working hours configuration
2. System accounts for existing job assignments
3. System respects marked unavailable periods
4. System calculates available time slots by duration
5. System performs calculation in < 100ms per contractor

## Tasks / Subtasks

- [ ] Task 1: Create Availability Service Domain Service (AC: 1, 2, 3, 4)
  - [ ] Create AvailabilityService domain service
  - [ ] Implement working hours consideration logic
  - [ ] Implement assignment conflict detection
  - [ ] Implement unavailable period handling
  - [ ] Implement time slot calculation by duration
- [ ] Task 2: Implement Availability Calculation Algorithm (AC: 1, 2, 3, 4)
  - [ ] Load contractor working hours
  - [ ] Load existing assignments for date range
  - [ ] Load unavailable periods
  - [ ] Calculate available windows
  - [ ] Split windows into time slots by duration
  - [ ] Account for travel time buffers
- [ ] Task 3: Create Get Availability Query (AC: 1, 2, 3, 4, 5)
  - [ ] Create GetContractorAvailabilityQuery
  - [ ] Implement query handler using AvailabilityService
  - [ ] Optimize database queries for performance
  - [ ] Cache frequently accessed data
  - [ ] Return available time slots
- [ ] Task 4: Create API Endpoint (AC: 5)
  - [ ] Create GET /api/contractors/{id}/availability endpoint
  - [ ] Accept date range and duration parameters
  - [ ] Return list of available time slots
  - [ ] Ensure response time < 100ms
- [ ] Task 5: Write Unit Tests
  - [ ] Test working hours consideration
  - [ ] Test assignment conflict detection
  - [ ] Test unavailable period handling
  - [ ] Test time slot calculation
  - [ ] Test performance requirements

## Dev Notes

- Relevant architecture patterns and constraints
  - Domain Service: AvailabilityService encapsulates business logic
  - Performance: Optimize queries, use caching where appropriate
  - Time Handling: Use UTC for all timestamps, convert for display
- Source tree components to touch
  - `backend/Services/AvailabilityService.cs` - Domain service
  - `backend/Queries/GetContractorAvailabilityQuery.cs`
  - `backend/Handlers/GetContractorAvailabilityHandler.cs`
  - `backend/DTOs/AvailabilityTimeSlotDto.cs`
  - `backend/Controllers/ContractorsController.cs`
- Testing standards summary
  - Unit tests for availability calculation logic
  - Integration tests for API endpoint
  - Performance tests to verify < 100ms requirement

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Domain service in Services folder
  - Follow DDD patterns
- Detected conflicts or variances (with rationale)
  - None identified

### References

- [Source: docs/epics/epic-2-availability-engine.md#FR-005]
- [Source: docs/Database-Schema.md#CONTRACTOR_WORKING_HOURS]
- [Source: docs/PRD-Master.md#Section-5.2]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

