# Epic 5: Event-Driven Updates

**Epic ID:** 5  
**Title:** Event-Driven Updates  
**Priority:** P0 (Critical)  
**Status:** Active Development

---

## Overview

This epic implements event-driven architecture for real-time updates throughout the system. Events are published when key actions occur (job assignments, schedule changes, ratings) and trigger notifications and data updates across the system.

## Goal

Enable real-time communication and data synchronization across the SmartScheduler system through event-driven architecture, ensuring all stakeholders receive timely updates about relevant changes.

---

## Functional Requirements

### FR-011: Job Assignment Event
- **Description**: System shall publish JobAssigned event on assignment
- **Priority**: P0 (Critical)
- **Event Payload**:
  - jobId, contractorId, assignmentId, scheduledTimeSlot, timestamp
- **Acceptance Criteria**:
  - Published via message bus (SNS/SQS)
  - SignalR notification to dispatcher UI
  - SignalR notification to contractor (if online)
  - Idempotent event handling
  - Delivery guarantee: at-least-once

### FR-012: Schedule Updated Event
- **Description**: System shall publish ScheduleUpdated event
- **Priority**: P1 (High)
- **Event Payload**:
  - contractorId, updatedFields, previousValues, timestamp
- **Acceptance Criteria**:
  - Published on contractor schedule changes
  - Triggers availability recalculation
  - Updates cached availability data
  - Real-time UI updates via SignalR

### FR-013: Contractor Rated Event
- **Description**: System shall publish ContractorRated event
- **Priority**: P1 (High)
- **Event Payload**:
  - contractorId, jobId, rating, previousRating, timestamp
- **Acceptance Criteria**:
  - Published on rating updates
  - Recalculates contractor average rating
  - Updates contractor profile
  - Triggers re-ranking if active recommendations exist

---

## Domain Events

- **JobAssigned**: Published when a job is assigned to a contractor
- **ScheduleUpdated**: Published when contractor schedule changes
- **ContractorRated**: Published when a contractor receives a rating

---

## Technical Components

- **Message Bus**: AWS SNS/SQS or In-Memory for event publishing
- **SignalR**: Real-time WebSocket communication for UI updates
- **Event Handlers**: Process events and trigger side effects

---

## Dependencies

- Epic 1: Contractor Management (CRUD) - Required for contractor events
- Epic 2: Availability Engine - Uses ScheduleUpdated events
- Epic 4: Scoring & Ranking Engine - Uses ContractorRated events
- SignalR infrastructure
- Message bus infrastructure (AWS SNS/SQS or equivalent)

---

## References

- Master PRD: `PRD-Master.md` - Section 5.5
- Backend PRD: `PRD-Backend.md` - Section 4.5 Domain Events
- API Specification: `API-Specification.md`

