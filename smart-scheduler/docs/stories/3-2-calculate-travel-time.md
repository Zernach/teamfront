# Story 3.2: Calculate Travel Time

Status: drafted

## Story

As a system component,
I want to estimate travel time between locations,
so that availability calculations can account for time needed to travel between job sites.

## Acceptance Criteria

1. System considers time of day for traffic patterns
2. System returns optimistic, realistic, and pessimistic estimates
3. System uses travel time in availability calculation for job sequencing
4. System caches travel time calculations for performance

## Tasks / Subtasks

- [ ] Task 1: Enhance Distance Service for Travel Time (AC: 1, 2)
  - [ ] Add CalculateTravelTime method to IDistanceCalculationService
  - [ ] Integrate time-of-day traffic data
  - [ ] Calculate optimistic estimate (best case)
  - [ ] Calculate realistic estimate (typical)
  - [ ] Calculate pessimistic estimate (worst case)
- [ ] Task 2: Implement Time-of-Day Traffic Consideration (AC: 1)
  - [ ] Determine time of day for travel
  - [ ] Apply traffic multipliers based on time
  - [ ] Consider day of week (weekday vs weekend)
  - [ ] Use historical traffic data if available
- [ ] Task 3: Create Travel Time DTO (AC: 2)
  - [ ] Create TravelTimeEstimate DTO
  - [ ] Include optimistic, realistic, pessimistic times
  - [ ] Include distance and route information
- [ ] Task 4: Integrate with Availability Service (AC: 3)
  - [ ] Update AvailabilityService to use travel time
  - [ ] Use realistic estimate for availability calculations
  - [ ] Account for travel time in time slot calculations
- [ ] Task 5: Implement Caching (AC: 4)
  - [ ] Cache travel time calculations
  - [ ] Use origin + destination + time-of-day as cache key
  - [ ] Set appropriate cache expiration
- [ ] Task 6: Create API Endpoint (AC: 2)
  - [ ] Create POST /api/distance/travel-time endpoint
  - [ ] Accept origin, destination, and departure time
  - [ ] Return travel time estimates
- [ ] Task 7: Write Unit Tests
  - [ ] Test time-of-day traffic consideration
  - [ ] Test three estimate calculations
  - [ ] Test caching behavior
  - [ ] Test integration with availability service

## Dev Notes

- Relevant architecture patterns and constraints
  - Extend existing distance service
  - Caching: Reuse caching infrastructure from Story 3.1
  - Integration: Work with AvailabilityService from Epic 2
- Source tree components to touch
  - `backend/Services/IDistanceCalculationService.cs` - Add travel time method
  - `backend/Services/GoogleMapsDistanceService.cs` - Implement travel time
  - `backend/Services/OpenRouteServiceDistanceService.cs` - Implement travel time
  - `backend/DTOs/TravelTimeEstimateDto.cs`
  - `backend/Services/AvailabilityService.cs` - Integrate travel time
  - `backend/Queries/CalculateTravelTimeQuery.cs`
  - `backend/Controllers/DistanceController.cs`
- Testing standards summary
  - Unit tests for travel time calculation
  - Test time-of-day logic
  - Test three estimate scenarios
  - Integration tests with availability service

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Extend existing distance service
  - Follow same patterns as distance calculation
- Detected conflicts or variances (with rationale)
  - Depends on Story 3.1 for distance calculation infrastructure

### References

- [Source: docs/epics/epic-3-distance-proximity-calculation.md#FR-008]
- [Source: docs/epics/epic-2-availability-engine.md] - For integration
- [Source: docs/PRD-Master.md#Section-5.3]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

