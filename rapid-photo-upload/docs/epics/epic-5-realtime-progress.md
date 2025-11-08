# Epic 5: Real-Time Progress

**Epic ID:** 5  
**Title:** Real-Time Progress  
**Description:** WebSocket implementation, event publishing

## Overview

Implement real-time upload progress tracking using WebSocket connections or Server-Sent Events (SSE). This enables clients to receive live updates on upload status, progress percentages, and completion notifications without polling.

## WebSocket Implementation

### Connection Management
- WebSocket endpoint: `/ws/upload-progress`
- Connection authentication via JWT token
- User-specific channels (per-user isolation)
- Connection lifecycle management (connect, disconnect, reconnect)

### Message Format
```json
{
  "type": "upload_progress",
  "photoId": "uuid",
  "jobId": "uuid",
  "progress": 45.5,
  "status": "UPLOADING",
  "timestamp": "ISO8601"
}
```

### Event Types
- `upload_started`: Photo upload initiated
- `upload_progress`: Progress update (percentage)
- `upload_completed`: Upload finished successfully
- `upload_failed`: Upload failed with error
- `job_progress`: Overall job progress update
- `job_completed`: All photos in job completed

## Server-Sent Events (SSE) Alternative

### SSE Endpoint
- `GET /api/v1/upload-progress/{jobId}` - SSE stream
- Content-Type: text/event-stream
- Keep-alive mechanism
- Automatic reconnection support

### SSE Message Format
```
event: upload_progress
data: {"photoId":"uuid","progress":45.5,"status":"UPLOADING"}

event: upload_completed
data: {"photoId":"uuid","status":"COMPLETED"}
```

## Event Publishing

### Domain Event Integration
- Subscribe to Photo domain events
- Subscribe to UploadJob domain events
- Transform domain events to WebSocket/SSE messages
- Publish to user-specific channels

### Progress Calculation
- Real-time progress percentage (0-100%)
- Based on bytes transferred vs total file size
- Aggregated job progress calculation
- Smooth progress updates (throttled to avoid spam)

## Connection Handling

### Authentication
- JWT token validation on connection
- User identification from token claims
- Channel subscription based on userId

### Error Handling
- Connection errors handled gracefully
- Automatic reconnection with exponential backoff
- Connection timeout handling
- Heartbeat/ping-pong for connection health

### Scalability
- Support for clustering (Redis adapter or sticky sessions)
- Horizontal scaling considerations
- Connection pooling and resource management

## Client Integration

### WebSocket Client (Web)
- Socket.io or native WebSocket API
- Connection management with auto-reconnect
- Event listeners for progress updates
- UI state updates based on events

### SSE Client (Mobile)
- EventSource API for SSE
- Fallback to polling if SSE unavailable
- Background connection handling

## Performance Requirements

- Event latency: < 100ms from domain event to client
- Connection overhead: Minimal impact on server resources
- Scalability: Support 10,000+ concurrent connections
- Message throughput: Handle 100+ events/second per user

## Acceptance Criteria

- [ ] WebSocket endpoint implemented
- [ ] SSE endpoint as alternative
- [ ] JWT authentication on connection
- [ ] Domain event subscription working
- [ ] Progress events published in real-time
- [ ] User-specific channel isolation
- [ ] Connection error handling
- [ ] Auto-reconnection support
- [ ] Performance targets met
- [ ] Clustering support (if needed)

## Dependencies

- Epic 1: Backend Core (domain events)
- Epic 3: Upload API (upload progress events)
- WebSocket library (Spring WebSocket or Socket.io)
- Message broker (optional, for clustering)

## Related Epics

- Epic 7: Web Upload UI (consumes WebSocket events)
- Epic 10: Mobile Upload (consumes SSE/polling)

