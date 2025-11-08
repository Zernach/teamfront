# Story 2.2: Find Open Time Slots

Status: drafted

## Story

As a dispatcher,
I want to find available time slots for a specific job duration,
so that I can identify when a contractor can start a job assignment.

## Acceptance Criteria

1. System accepts Contractor ID, desired date, and job duration as input
2. System returns list of available time slots
3. System accounts for travel time between jobs
4. System enforces minimum 30-minute buffer between jobs
5. System handles overnight jobs spanning multiple days

## Tasks / Subtasks

- [ ] Task 1: Enhance Availability Service for Time Slots (AC: 1, 2, 3, 4, 5)
  - [ ] Add FindOpenTimeSlots method to AvailabilityService
  - [ ] Implement travel time consideration
  - [ ] Implement 30-minute buffer enforcement
  - [ ] Handle multi-day job scenarios
  - [ ] Return time slots with start/end times
- [ ] Task 2: Integrate Travel Time Calculation (AC: 3)
  - [ ] Use Epic 3 distance calculation service
  - [ ] Calculate travel time from previous job location
  - [ ] Add travel time to time slot calculations
  - [ ] Handle first job of day (no travel time)
- [ ] Task 3: Create Find Time Slots Query (AC: 1, 2)
  - [ ] Create FindOpenTimeSlotsQuery
  - [ ] Accept contractor ID, date, and duration
  - [ ] Call AvailabilityService
  - [ ] Return time slot DTOs
- [ ] Task 4: Create API Endpoint (AC: 1, 2)
  - [ ] Create GET /api/contractors/{id}/time-slots endpoint
  - [ ] Accept date and duration query parameters
  - [ ] Return list of available time slots
  - [ ] Handle invalid input gracefully
- [ ] Task 5: Write Unit Tests
  - [ ] Test time slot calculation with travel time
  - [ ] Test 30-minute buffer enforcement
  - [ ] Test multi-day job handling
  - [ ] Test edge cases (first job, last job, etc.)

## Dev Notes

- Relevant architecture patterns and constraints
  - Domain Service: Reuse AvailabilityService from Story 2.1
  - Integration: Depend on Epic 3 for travel time calculation
  - Business Rules: Enforce minimum buffer between jobs
- Source tree components to touch
  - `backend/Services/AvailabilityService.cs` - Add FindOpenTimeSlots method
  - `backend/Queries/FindOpenTimeSlotsQuery.cs`
  - `backend/Handlers/FindOpenTimeSlotsHandler.cs`
  - `backend/DTOs/TimeSlotDto.cs`
  - `backend/Controllers/ContractorsController.cs`
- Testing standards summary
  - Unit tests for time slot logic
  - Integration tests with travel time service
  - Test buffer enforcement

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Extend existing AvailabilityService
  - Follow DDD patterns
- Detected conflicts or variances (with rationale)
  - Depends on Epic 3 for travel time - may need to mock for initial implementation

### References

- [Source: docs/epics/epic-2-availability-engine.md#FR-006]
- [Source: docs/epics/epic-3-distance-proximity-calculation.md] - For travel time
- [Source: docs/PRD-Master.md#Section-5.2]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

