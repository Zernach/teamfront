# Story 1.3: Update Contractor

Status: drafted

## Story

As a dispatcher,
I want to update contractor information,
so that contractor profiles remain accurate and reflect current status and capabilities.

## Acceptance Criteria

1. All fields except ID are editable
2. System validates all field updates
3. System records UpdatedAt timestamp on changes
4. System implements optimistic concurrency control
5. System tracks change history

## Tasks / Subtasks

- [ ] Task 1: Implement Update Contractor Command (AC: 1, 2, 3)
  - [ ] Create UpdateContractorCommand DTO
  - [ ] Validate all updatable fields
  - [ ] Prevent ID modification
  - [ ] Update UpdatedAt timestamp
  - [ ] Save changes via repository
- [ ] Task 2: Implement Optimistic Concurrency Control (AC: 4)
  - [ ] Add RowVersion/ConcurrencyToken to Contractor entity
  - [ ] Check concurrency token on update
  - [ ] Handle concurrency conflicts (return 409 Conflict)
  - [ ] Update concurrency token on successful update
- [ ] Task 3: Implement Change History Tracking (AC: 5)
  - [ ] Create ContractorChangeHistory entity
  - [ ] Track field changes (before/after values)
  - [ ] Record change timestamp and user
  - [ ] Store change reason/notes
- [ ] Task 4: Create API Endpoint (AC: 1, 2, 3, 4)
  - [ ] Create PUT /api/contractors/{id} endpoint
  - [ ] Map request DTO to command
  - [ ] Handle validation errors
  - [ ] Handle concurrency conflicts
  - [ ] Return 200 OK with updated contractor
- [ ] Task 5: Write Unit Tests
  - [ ] Test successful update
  - [ ] Test ID modification prevention
  - [ ] Test concurrency conflict handling
  - [ ] Test change history recording
  - [ ] Test validation of all fields

## Dev Notes

- Relevant architecture patterns and constraints
  - Optimistic Concurrency: Use EF Core concurrency tokens
  - Change Tracking: Audit trail pattern for compliance
  - Validation: Validate all fields on update
- Source tree components to touch
  - `backend/Models/Contractor.cs` - Add RowVersion property
  - `backend/Models/ContractorChangeHistory.cs` - New entity
  - `backend/Commands/UpdateContractorCommand.cs`
  - `backend/Handlers/UpdateContractorHandler.cs`
  - `backend/Controllers/ContractorsController.cs`
- Testing standards summary
  - Unit tests for update logic
  - Integration tests for concurrency handling
  - Test change history recording

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follow CQRS command pattern
  - Use concurrency tokens for optimistic locking
- Detected conflicts or variances (with rationale)
  - None identified

### References

- [Source: docs/epics/epic-1-contractor-management.md#FR-003]
- [Source: docs/Database-Schema.md#CONTRACTORS]
- [Source: docs/PRD-Master.md#Section-5.1]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

