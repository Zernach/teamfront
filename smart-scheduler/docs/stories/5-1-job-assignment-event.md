# Story 5.1: Job Assignment Event

Status: drafted

## Story

As a system component,
I want to publish JobAssigned events when jobs are assigned,
so that all stakeholders receive real-time notifications about job assignments.

## Acceptance Criteria

1. System publishes JobAssigned event via message bus (SNS/SQS) on assignment
2. System sends SignalR notification to dispatcher UI
3. System sends SignalR notification to contractor (if online)
4. Event payload includes: jobId, contractorId, assignmentId, scheduledTimeSlot, timestamp
5. System handles events idempotently
6. System guarantees at-least-once delivery

## Tasks / Subtasks

- [ ] Task 1: Create JobAssigned Domain Event (AC: 4)
  - [ ] Create JobAssigned domain event class
  - [ ] Include jobId, contractorId, assignmentId, scheduledTimeSlot, timestamp
  - [ ] Implement IIntegrationEvent interface
- [ ] Task 2: Implement Event Publishing Infrastructure (AC: 1, 6)
  - [ ] Create IEventBus interface
  - [ ] Implement AWS SNS/SQS event bus
  - [ ] Implement in-memory event bus for development
  - [ ] Ensure at-least-once delivery guarantee
  - [ ] Handle publishing errors
- [ ] Task 3: Publish Event on Job Assignment (AC: 1, 4)
  - [ ] Update AssignJob command handler
  - [ ] Publish JobAssigned event after successful assignment
  - [ ] Include all required event data
- [ ] Task 4: Implement SignalR Hub (AC: 2, 3)
  - [ ] Create NotificationHub SignalR hub
  - [ ] Implement dispatcher notification method
  - [ ] Implement contractor notification method
  - [ ] Handle connection management
- [ ] Task 5: Send SignalR Notifications (AC: 2, 3)
  - [ ] Send notification to dispatcher group on event
  - [ ] Send notification to specific contractor if online
  - [ ] Handle offline contractors gracefully
- [ ] Task 6: Implement Idempotency (AC: 5)
  - [ ] Add idempotency key to events
  - [ ] Check for duplicate events
  - [ ] Prevent duplicate processing
- [ ] Task 7: Write Unit Tests
  - [ ] Test event publishing
  - [ ] Test SignalR notifications
  - [ ] Test idempotency handling
  - [ ] Test error scenarios

## Dev Notes

- Relevant architecture patterns and constraints
  - Domain Events: Use domain event pattern
  - Event-Driven Architecture: Publish/subscribe pattern
  - SignalR: Real-time WebSocket communication
  - Idempotency: Ensure event processing is idempotent
- Source tree components to touch
  - `backend/Domain/Events/JobAssigned.cs` - Domain event
  - `backend/Infrastructure/Events/IEventBus.cs` - Interface
  - `backend/Infrastructure/Events/AwsEventBus.cs` - AWS implementation
  - `backend/Infrastructure/Events/InMemoryEventBus.cs` - Dev implementation
  - `backend/Hubs/NotificationHub.cs` - SignalR hub
  - `backend/Handlers/AssignJobHandler.cs` - Publish event
- Testing standards summary
  - Unit tests for event publishing
  - Integration tests for SignalR
  - Test idempotency scenarios

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Domain events in Domain/Events folder
  - Infrastructure in Infrastructure folder
  - SignalR hubs in Hubs folder
- Detected conflicts or variances (with rationale)
  - Requires AWS SNS/SQS setup or alternative message bus

### References

- [Source: docs/epics/epic-5-event-driven-updates.md#FR-011]
- [Source: docs/PRD-Master.md#Section-5.5]
- [Source: docs/PRD-Backend.md#Section-4.5]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

