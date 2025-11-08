# Epic 1: Contractor Management (CRUD)

**Epic ID:** 1  
**Title:** Contractor Management (CRUD)  
**Priority:** P0 (Critical)  
**Status:** Active Development

---

## Overview

This epic covers all contractor profile management operations including creation, reading, updating, and deletion/deactivation of contractor records. These are foundational capabilities required for the SmartScheduler system to function.

## Goal

Enable complete lifecycle management of contractor profiles with proper validation, audit trails, and data integrity controls.

---

## Functional Requirements

### FR-001: Create Contractor
- **Description**: System shall allow creation of new contractor profiles
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - All required fields validated before save
  - Duplicate contractor detection by name + location
  - Default working hours set to Mon-Fri 8AM-5PM
  - Unique contractor ID generated
  - CreatedAt timestamp recorded

### FR-002: Read/View Contractor
- **Description**: System shall allow viewing contractor details
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - Individual contractor view by ID
  - List view with filtering and pagination
  - Search by name, type, location, rating
  - Include current availability status
  - Show job history and statistics

### FR-003: Update Contractor
- **Description**: System shall allow updating contractor information
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - All fields except ID are editable
  - Validation on all field updates
  - UpdatedAt timestamp recorded on changes
  - Optimistic concurrency control implemented
  - Change history tracked

### FR-004: Delete/Deactivate Contractor
- **Description**: System shall allow soft deletion of contractors
- **Priority**: P1 (High)
- **Acceptance Criteria**:
  - Soft delete (status = Inactive) instead of hard delete
  - Cannot delete contractors with active assignments
  - Deleted contractors excluded from searches
  - Admin can restore deleted contractors
  - Audit trail maintained

---

## Related Domain Entities

- **Contractor**: Core domain entity with properties:
  - Id: Guid
  - Name: string
  - Type: ContractorType (enum: Flooring, Tile, Carpet, Multi)
  - Rating: decimal (0.0 - 5.0)
  - BaseLocation: Location (value object)
  - Schedule: WorkingHours (value object)
  - Skills: List<Skill>
  - Status: ContractorStatus (enum: Active, Inactive, OnLeave)
  - CreatedAt: DateTime
  - UpdatedAt: DateTime

---

## Dependencies

- Database schema for Contractor entity
- Authentication and authorization system
- Validation framework

---

## References

- Master PRD: `PRD-Master.md` - Section 5.1
- Backend PRD: `PRD-Backend.md`
- Database Schema: `Database-Schema.md`

