# Story 1.1: Create Contractor

Status: drafted

## Story

As a dispatcher,
I want to create new contractor profiles with all required information,
so that contractors can be added to the system and made available for job assignments.

## Acceptance Criteria

1. System validates all required fields before saving contractor
2. System detects duplicate contractors by name + location combination
3. System sets default working hours to Mon-Fri 8AM-5PM if not specified
4. System generates unique contractor ID (GUID)
5. System records CreatedAt timestamp automatically
6. System returns created contractor with all fields populated

## Tasks / Subtasks

- [ ] Task 1: Create Contractor Entity and EF Core Configuration (AC: 1, 4, 5)
  - [ ] Define Contractor entity with all properties
  - [ ] Configure EF Core owned entity for BaseLocation value object
  - [ ] Configure EF Core owned entity for WorkingHours value object
  - [ ] Set up GUID primary key generation
  - [ ] Add CreatedAt/UpdatedAt audit columns
- [ ] Task 2: Implement Create Contractor Command Handler (AC: 1, 2, 3, 4, 5, 6)
  - [ ] Create CreateContractorCommand DTO
  - [ ] Implement validation for required fields
  - [ ] Implement duplicate detection logic (name + location)
  - [ ] Set default working hours if not provided
  - [ ] Generate contractor ID
  - [ ] Save to database via repository
  - [ ] Return created contractor DTO
- [ ] Task 3: Create API Endpoint (AC: 6)
  - [ ] Create POST /api/contractors endpoint
  - [ ] Map request DTO to command
  - [ ] Handle validation errors
  - [ ] Return 201 Created with contractor data
- [ ] Task 4: Write Unit Tests
  - [ ] Test contractor creation with valid data
  - [ ] Test duplicate detection
  - [ ] Test default working hours assignment
  - [ ] Test validation of required fields
  - [ ] Test GUID generation

## Dev Notes

- Relevant architecture patterns and constraints
  - Domain-Driven Design: Contractor is a core aggregate root
  - CQRS: Use Command pattern for creation
  - Value Objects: BaseLocation and WorkingHours stored as owned entities
  - Validation: Use FluentValidation or Data Annotations
- Source tree components to touch
  - `backend/Models/Contractor.cs` - Entity definition
  - `backend/Data/ApplicationDbContext.cs` - EF Core configuration
  - `backend/Commands/CreateContractorCommand.cs` - Command DTO
  - `backend/Handlers/CreateContractorHandler.cs` - Command handler
  - `backend/Controllers/ContractorsController.cs` - API endpoint
  - `backend/Validators/CreateContractorValidator.cs` - Validation rules
- Testing standards summary
  - Unit tests for command handler logic
  - Integration tests for API endpoint
  - Test duplicate detection edge cases
  - Verify database constraints

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follow .NET 8 Web API conventions
  - Use vertical slice architecture pattern
  - Commands/Handlers in feature folders
- Detected conflicts or variances (with rationale)
  - None identified

### References

- [Source: docs/epics/epic-1-contractor-management.md#FR-001]
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

