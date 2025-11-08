# Story 5.3: Contractor Rated Event

Status: drafted

## Story

As a system component,
I want to publish ContractorRated events when contractors receive ratings,
so that contractor profiles and rankings can be updated in real-time.

## Acceptance Criteria

1. System publishes ContractorRated event on rating updates
2. Event payload includes: contractorId, jobId, rating, previousRating, timestamp
3. System recalculates contractor average rating on event
4. System updates contractor profile with new rating
5. System triggers re-ranking if active recommendations exist

## Tasks / Subtasks

- [ ] Task 1: Create ContractorRated Domain Event (AC: 2)
  - [ ] Create ContractorRated domain event class
  - [ ] Include contractorId, jobId, rating, previousRating, timestamp
  - [ ] Implement IIntegrationEvent interface
- [ ] Task 2: Publish Event on Rating Updates (AC: 1, 2)
  - [ ] Update RateContractor command handler
  - [ ] Capture previous rating before update
  - [ ] Publish ContractorRated event after successful rating
  - [ ] Include all required event data
- [ ] Task 3: Create Event Handler for Rating Recalculation (AC: 3, 4)
  - [ ] Create ContractorRatedEventHandler
  - [ ] Recalculate contractor average rating
  - [ ] Update contractor profile with new average
  - [ ] Persist updated rating to database
- [ ] Task 4: Trigger Re-ranking for Active Recommendations (AC: 5)
  - [ ] Check for active recommendations for contractor
  - [ ] Trigger re-scoring if recommendations exist
  - [ ] Update recommendation scores
  - [ ] Notify dispatcher UI of score changes
- [ ] Task 5: Send SignalR Notifications (AC: 4)
  - [ ] Send notification via NotificationHub
  - [ ] Include updated rating information
  - [ ] Notify relevant stakeholders
- [ ] Task 6: Write Unit Tests
  - [ ] Test event publishing on rating update
  - [ ] Test rating recalculation
  - [ ] Test contractor profile update
  - [ ] Test re-ranking trigger
  - [ ] Test SignalR notifications

## Dev Notes

- Relevant architecture patterns and constraints
  - Domain Events: Use domain event pattern
  - Event Handlers: Process events asynchronously
  - Integration: Works with ScoringService from Epic 4
- Source tree components to touch
  - `backend/Domain/Events/ContractorRated.cs` - Domain event
  - `backend/Handlers/RateContractorHandler.cs` - Publish event
  - `backend/Handlers/ContractorRatedEventHandler.cs` - Event handler
  - `backend/Services/ScoringService.cs` - Re-ranking
  - `backend/Hubs/NotificationHub.cs` - SignalR notifications
- Testing standards summary
  - Unit tests for event publishing
  - Integration tests for event handling
  - Test rating recalculation logic
  - Test re-ranking scenarios

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Domain events in Domain/Events folder
  - Event handlers in Handlers folder
- Detected conflicts or variances (with rationale)
  - Depends on Story 5.1 for event bus infrastructure
  - Depends on Story 4.1 for scoring service

### References

- [Source: docs/epics/epic-5-event-driven-updates.md#FR-013]
- [Source: docs/epics/epic-4-scoring-ranking-engine.md] - For re-ranking
- [Source: docs/PRD-Master.md#Section-5.5]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

