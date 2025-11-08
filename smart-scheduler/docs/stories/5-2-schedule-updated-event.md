# Story 5.2: Schedule Updated Event

Status: drafted

## Story

As a system component,
I want to publish ScheduleUpdated events when contractor schedules change,
so that availability calculations and cached data can be updated in real-time.

## Acceptance Criteria

1. System publishes ScheduleUpdated event on contractor schedule changes
2. Event payload includes: contractorId, updatedFields, previousValues, timestamp
3. System triggers availability recalculation on event
4. System updates cached availability data
5. System sends real-time UI updates via SignalR

## Tasks / Subtasks

- [ ] Task 1: Create ScheduleUpdated Domain Event (AC: 2)
  - [ ] Create ScheduleUpdated domain event class
  - [ ] Include contractorId, updatedFields, previousValues, timestamp
  - [ ] Implement IIntegrationEvent interface
- [ ] Task 2: Publish Event on Schedule Updates (AC: 1, 2)
  - [ ] Update UpdateContractorSchedule command handler
  - [ ] Capture previous values before update
  - [ ] Publish ScheduleUpdated event after successful update
  - [ ] Include all required event data
- [ ] Task 3: Create Event Handler for Availability Recalculation (AC: 3)
  - [ ] Create ScheduleUpdatedEventHandler
  - [ ] Trigger availability recalculation
  - [ ] Use AvailabilityService to recalculate
  - [ ] Handle recalculation errors
- [ ] Task 4: Update Cached Availability Data (AC: 4)
  - [ ] Invalidate cached availability for contractor
  - [ ] Optionally pre-calculate and cache new availability
  - [ ] Update cache on recalculation
- [ ] Task 5: Send SignalR UI Updates (AC: 5)
  - [ ] Send notification via NotificationHub
  - [ ] Include updated schedule information
  - [ ] Notify dispatcher UI of changes
- [ ] Task 6: Write Unit Tests
  - [ ] Test event publishing on schedule update
  - [ ] Test availability recalculation trigger
  - [ ] Test cache invalidation
  - [ ] Test SignalR notifications

## Dev Notes

- Relevant architecture patterns and constraints
  - Domain Events: Use domain event pattern
  - Event Handlers: Process events asynchronously
  - Caching: Invalidate and refresh cache on updates
  - Integration: Works with AvailabilityService from Epic 2
- Source tree components to touch
  - `backend/Domain/Events/ScheduleUpdated.cs` - Domain event
  - `backend/Handlers/UpdateContractorScheduleHandler.cs` - Publish event
  - `backend/Handlers/ScheduleUpdatedEventHandler.cs` - Event handler
  - `backend/Hubs/NotificationHub.cs` - SignalR notifications
  - `backend/Services/AvailabilityService.cs` - Recalculation
- Testing standards summary
  - Unit tests for event publishing
  - Integration tests for event handling
  - Test cache invalidation
  - Test SignalR notifications

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Domain events in Domain/Events folder
  - Event handlers in Handlers folder
- Detected conflicts or variances (with rationale)
  - Depends on Story 5.1 for event bus infrastructure

### References

- [Source: docs/epics/epic-5-event-driven-updates.md#FR-012]
- [Source: docs/epics/epic-2-availability-engine.md] - For availability recalculation
- [Source: docs/PRD-Master.md#Section-5.5]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

