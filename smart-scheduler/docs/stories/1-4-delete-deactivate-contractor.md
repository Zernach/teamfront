# Story 1.4: Delete/Deactivate Contractor

Status: drafted

## Story

As a dispatcher,
I want to deactivate contractors instead of permanently deleting them,
so that historical data is preserved and contractors can be restored if needed.

## Acceptance Criteria

1. System performs soft delete (status = Inactive) instead of hard delete
2. System prevents deletion of contractors with active assignments
3. System excludes deleted contractors from searches by default
4. System allows admin to restore deleted contractors
5. System maintains audit trail of deletion

## Tasks / Subtasks

- [ ] Task 1: Implement Soft Delete Logic (AC: 1, 2)
  - [ ] Create DeactivateContractorCommand
  - [ ] Check for active assignments before deactivation
  - [ ] Set contractor status to Inactive
  - [ ] Record deactivation timestamp
  - [ ] Prevent deactivation if active assignments exist
- [ ] Task 2: Update Query Filters (AC: 3)
  - [ ] Modify list queries to exclude inactive contractors by default
  - [ ] Add optional includeInactive parameter for admin views
  - [ ] Update search queries to filter inactive contractors
- [ ] Task 3: Implement Restore Functionality (AC: 4)
  - [ ] Create RestoreContractorCommand
  - [ ] Set contractor status back to Active
  - [ ] Record restoration timestamp
  - [ ] Add admin authorization check
- [ ] Task 4: Create API Endpoints (AC: 1, 2, 4)
  - [ ] Create DELETE /api/contractors/{id} endpoint (soft delete)
  - [ ] Create POST /api/contractors/{id}/restore endpoint
  - [ ] Return appropriate error if active assignments exist
  - [ ] Return 200 OK on successful deactivation/restoration
- [ ] Task 5: Write Unit Tests
  - [ ] Test soft delete functionality
  - [ ] Test prevention of deletion with active assignments
  - [ ] Test exclusion from searches
  - [ ] Test restore functionality
  - [ ] Test admin authorization for restore

## Dev Notes

- Relevant architecture patterns and constraints
  - Soft Delete: Use status field instead of physical deletion
  - Audit Trail: Record deletion/restoration events
  - Business Rules: Enforce constraints (no deletion with active assignments)
- Source tree components to touch
  - `backend/Models/Contractor.cs` - Status enum includes Inactive
  - `backend/Commands/DeactivateContractorCommand.cs`
  - `backend/Commands/RestoreContractorCommand.cs`
  - `backend/Handlers/DeactivateContractorHandler.cs`
  - `backend/Handlers/RestoreContractorHandler.cs`
  - `backend/Controllers/ContractorsController.cs`
  - `backend/Queries/ListContractorsQuery.cs` - Update filters
- Testing standards summary
  - Unit tests for soft delete logic
  - Integration tests for active assignment check
  - Test query filtering

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follow soft delete pattern
  - Use status enum for state management
- Detected conflicts or variances (with rationale)
  - None identified

### References

- [Source: docs/epics/epic-1-contractor-management.md#FR-004]
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

