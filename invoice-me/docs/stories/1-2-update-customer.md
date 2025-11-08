# Story 1.2: Update Customer

Status: drafted

## Story

As a user,
I want to update an existing customer's information,
so that I can keep customer records current and accurate.

## Acceptance Criteria

1. User can update customer fields: firstName, lastName, email, phone, billingAddress, taxId
2. At least one field must be provided for update
3. Customer must exist (404 if not found)
4. Cannot update customer with DELETED status (409 Conflict)
5. If email is changed, new email must be unique (409 Conflict if duplicate)
6. Email format validation applies if email is being updated
7. Phone number format validation applies if phone is being updated
8. Address validation applies if billingAddress is being updated
9. Tax ID format validation applies if taxId is being updated
10. Name field validation applies if name fields are being updated
11. Update operation is audited with lastModified timestamp and user
12. API returns 200 OK with updated CustomerDetailDto on success
13. API returns 400 Bad Request with validation errors if validation fails
14. API returns 404 Not Found if customer doesn't exist
15. API returns 409 Conflict for business rule violations

## Tasks / Subtasks

- [ ] Task 1: Implement UpdateCustomerCommand and handler (AC: 1-11)
  - [ ] Create UpdateCustomerCommand DTO with optional fields
  - [ ] Create UpdateCustomerCommandHandler with @Transactional
  - [ ] Load existing customer by ID (throw EntityNotFoundException if not found)
  - [ ] Validate customer is not DELETED
  - [ ] Validate at least one field is provided
  - [ ] Implement email uniqueness check if email is being updated
  - [ ] Apply field-level validation for updated fields only
  - [ ] Update customer domain entity
  - [ ] Save updated customer via repository
  - [ ] Publish CustomerUpdated domain event
- [ ] Task 2: Implement REST API endpoint (AC: 12-15)
  - [ ] Add PUT /api/v1/customers/{id} endpoint to CustomerController
  - [ ] Create UpdateCustomerRequestDto with optional fields and validation
  - [ ] Map request DTO to command
  - [ ] Handle command execution
  - [ ] Map updated domain entity to CustomerDetailDto response
  - [ ] Implement error handling for not found (404)
  - [ ] Implement error handling for validation errors (400)
  - [ ] Implement error handling for business rule violations (409)
- [ ] Task 3: Update Customer domain entity (AC: 1, 11)
  - [ ] Implement Customer.update() method
  - [ ] Ensure audit info is updated on modification
  - [ ] Handle partial updates (only update provided fields)
- [ ] Task 4: Write integration tests (AC: All)
  - [ ] Test successful customer update
  - [ ] Test update with single field
  - [ ] Test update with multiple fields
  - [ ] Test validation failures
  - [ ] Test customer not found (404)
  - [ ] Test updating DELETED customer (409)
  - [ ] Test duplicate email on update (409)

## Dev Notes

- Follow DDD patterns: Update operations modify aggregate root
- Use partial update pattern: only update fields that are provided
- Validate business rules before applying updates
- Use Jakarta Bean Validation for request DTO validation
- Follow Vertical Slice Architecture: features/customers/commands/UpdateCustomer/
- Transaction boundary: Command handler method level
- Domain events: Publish CustomerUpdated event after successful save

### Project Structure Notes

- Commands: `features/customers/commands/UpdateCustomer/UpdateCustomerCommand.java`
- API: `features/customers/api/CustomerController.java` (add PUT endpoint)
- DTOs: `features/customers/dto/UpdateCustomerRequestDto.java`

### References

- [Source: docs/epics/epic-1-customer-domain.md#3.1.2 Customer Commands & Validation]
- [Source: docs/epics/epic-4-backend-infrastructure.md#4.3.1 Customer API]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

