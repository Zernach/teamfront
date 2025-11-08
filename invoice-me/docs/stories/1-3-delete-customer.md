# Story 1.3: Delete Customer

Status: drafted

## Story

As a user,
I want to delete a customer,
so that I can remove customers that are no longer needed while preserving data integrity.

## Acceptance Criteria

1. User can delete a customer by ID
2. Customer must exist (404 if not found)
3. Cannot delete customer with invoices in SENT or PAID status (409 Conflict)
4. Soft delete is default: marks customer as DELETED status, preserves data
5. Hard delete is optional: only allowed if no invoice history exists
6. Delete operation is audited
7. API returns 204 No Content on successful deletion
8. API returns 404 Not Found if customer doesn't exist
9. API returns 409 Conflict if customer has active invoices

## Tasks / Subtasks

- [ ] Task 1: Implement DeleteCustomerCommand and handler (AC: 1-6)
  - [ ] Create DeleteCustomerCommand DTO with hardDelete flag (default false)
  - [ ] Create DeleteCustomerCommandHandler with @Transactional
  - [ ] Load existing customer by ID (throw EntityNotFoundException if not found)
  - [ ] Check if customer has invoices in SENT or PAID status
  - [ ] If soft delete: Update customer status to DELETED
  - [ ] If hard delete: Validate no invoice history exists, then delete from repository
  - [ ] Publish CustomerDeleted domain event
- [ ] Task 2: Implement invoice existence check (AC: 3)
  - [ ] Create method in CustomerRepository or InvoiceRepository to check for active invoices
  - [ ] Query for invoices with customerId and status IN (SENT, PAID)
  - [ ] Throw BusinessRuleViolationException if active invoices found
- [ ] Task 3: Implement REST API endpoint (AC: 7-9)
  - [ ] Add DELETE /api/v1/customers/{id} endpoint to CustomerController
  - [ ] Support optional query parameter ?hardDelete=true
  - [ ] Map request to command
  - [ ] Handle command execution
  - [ ] Return 204 No Content on success
  - [ ] Implement error handling for not found (404)
  - [ ] Implement error handling for business rule violations (409)
- [ ] Task 4: Update Customer domain entity (AC: 4)
  - [ ] Ensure Customer.delete() method handles soft delete
  - [ ] Update status to DELETED for soft delete
- [ ] Task 5: Write integration tests (AC: All)
  - [ ] Test successful soft delete
  - [ ] Test successful hard delete (no invoices)
  - [ ] Test customer not found (404)
  - [ ] Test delete customer with SENT invoices (409)
  - [ ] Test delete customer with PAID invoices (409)
  - [ ] Test hard delete with invoice history (should fail)

## Dev Notes

- Follow DDD patterns: Delete operations modify aggregate root
- Soft delete preserves data integrity and audit trail
- Hard delete should be used sparingly and only when safe
- Business rule: Cannot delete customers with active invoices
- Follow Vertical Slice Architecture: features/customers/commands/DeleteCustomer/
- Transaction boundary: Command handler method level
- Domain events: Publish CustomerDeleted event after successful deletion

### Project Structure Notes

- Commands: `features/customers/commands/DeleteCustomer/DeleteCustomerCommand.java`
- API: `features/customers/api/CustomerController.java` (add DELETE endpoint)

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

