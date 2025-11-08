# Epic 2: Availability Engine

**Epic ID:** 2  
**Title:** Availability Engine  
**Priority:** P0 (Critical)  
**Status:** Active Development

---

## Overview

This epic implements the core availability calculation engine that determines when contractors are available for job assignments. It considers working hours, existing assignments, and unavailable periods to provide accurate availability information.

## Goal

Accurately determine contractor availability and identify open time slots for job assignments, enabling intelligent scheduling decisions.

---

## Functional Requirements

### FR-005: Calculate Contractor Availability
- **Description**: System shall accurately determine contractor availability
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Considers working hours configuration
  - Accounts for existing job assignments
  - Respects marked unavailable periods
  - Calculates available time slots by duration
  - Performance: < 100ms per contractor

### FR-006: Find Open Time Slots
- **Description**: System shall identify available time slots for job duration
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Input: Contractor ID, desired date, job duration
  - Output: List of available time slots
  - Accounts for travel time between jobs
  - Minimum 30-minute buffer between jobs
  - Handles overnight jobs spanning multiple days

---

## Related Domain Entities

- **Contractor**: Contains Schedule (WorkingHours value object)
- **Assignment**: Represents existing job assignments
- **WorkingHours**: Value object defining availability windows
- **TimeSlot**: Value object representing available time periods

---

## Domain Services

- **Availability Service**: Core domain service responsible for availability calculations

---

## Dependencies

- Epic 1: Contractor Management (CRUD) - Required for contractor data
- Database schema for Contractor, Assignment, and Schedule entities
- Time zone handling

---

## References

- Master PRD: `PRD-Master.md` - Section 5.2
- Backend PRD: `PRD-Backend.md` - Section 4.4 Domain Services
- Database Schema: `Database-Schema.md`

