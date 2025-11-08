# Story 5.2: Real-Time Progress Event Publishing

Status: drafted

## Story

As a system,
I want to publish real-time upload progress events via WebSocket,
so that clients receive live updates on upload status and progress.

## Acceptance Criteria

1. Event types defined: upload_started, upload_progress, upload_completed, upload_failed, job_progress, job_completed
2. Message format defined with required fields
3. Progress events published when photo upload progresses
4. Status events published when photo status changes
5. Job events published when job status changes
6. Events sent to user-specific WebSocket channels
7. Progress percentage calculated accurately
8. Events include timestamp
9. Events include photoId and jobId

## Tasks / Subtasks

- [ ] Task 1: Define event types (AC: 1)
  - [ ] Define upload_started event
  - [ ] Define upload_progress event
  - [ ] Define upload_completed event
  - [ ] Define upload_failed event
  - [ ] Define job_progress event
  - [ ] Define job_completed event
- [ ] Task 2: Define message format (AC: 2)
  - [ ] Create message structure with type, photoId, jobId, progress, status, timestamp
  - [ ] Define JSON schema
  - [ ] Document message format
- [ ] Task 3: Publish progress events (AC: 3)
  - [ ] Listen to PhotoUploadProgressed domain events
  - [ ] Calculate progress percentage
  - [ ] Publish upload_progress WebSocket message
  - [ ] Send to user's WebSocket channel
- [ ] Task 4: Publish status events (AC: 4)
  - [ ] Listen to PhotoUploadStarted events → publish upload_started
  - [ ] Listen to PhotoUploadCompleted events → publish upload_completed
  - [ ] Listen to PhotoUploadFailed events → publish upload_failed
  - [ ] Send to user's WebSocket channel
- [ ] Task 5: Publish job events (AC: 5)
  - [ ] Listen to UploadJobProgressed events → publish job_progress
  - [ ] Listen to UploadJobCompleted events → publish job_completed
  - [ ] Calculate overall job progress
  - [ ] Send to user's WebSocket channel
- [ ] Task 6: Send to user channels (AC: 6)
  - [ ] Route messages to user-specific channels
  - [ ] Broadcast to all user's active connections
  - [ ] Ensure user isolation
- [ ] Task 7: Calculate progress accurately (AC: 7)
  - [ ] Calculate: (bytesUploaded / totalBytes) * 100
  - [ ] Round to 2 decimal places
  - [ ] Handle edge cases (0%, 100%)
- [ ] Task 8: Include timestamp (AC: 8)
  - [ ] Add ISO 8601 timestamp to all events
  - [ ] Use server time
- [ ] Task 9: Include identifiers (AC: 9)
  - [ ] Include photoId in photo events
  - [ ] Include jobId in all events
  - [ ] Include userId (implicit via channel)

## Dev Notes

- Listen to domain events from Epic 1
- Use Spring Events or custom event bus
- WebSocket messages should be lightweight
- Progress updates should be throttled (e.g., every 1%)

### Project Structure Notes

- Event Listener: `infrastructure/events/UploadProgressEventListener.java`
- WebSocket Publisher: `infrastructure/websocket/WebSocketEventPublisher.java`
- Message DTO: `api/dto/UploadProgressMessage.java`
- Event Types: `domain/events/UploadProgressEventType.java`

### References

- [Source: docs/epics/epic-5-realtime-progress.md#Event Types]
- [Source: docs/epics/epic-5-realtime-progress.md#Message Format]
- [Source: docs/epics/epic-1-backend-core.md#Domain Events]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

