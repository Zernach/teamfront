# Story 2.2: Update Invoice (Draft Only)

Status: drafted

## Story

As a user,
I want to update a draft invoice,
so that I can modify invoice details before sending it to the customer.

## Acceptance Criteria

1. User can update invoice fields: invoiceDate, dueDate, lineItems, taxAmount, notes
2. Invoice must exist (404 if not found)
3. Invoice must be in DRAFT status (409 Conflict if not draft)
4. Cannot update SENT, PAID, or CANCELLED invoices
5. Same validation rules apply as CreateInvoiceCommand for modified fields
6. Customer must exist and be ACTIVE if customerId is being changed
7. At least one line item must remain after update
8. Line totals, subtotal, totalAmount, and balance are recalculated after update
9. Update operation is audited with lastModified timestamp and user
10. API returns 200 OK with updated InvoiceDetailDto on success
11. API returns 400 Bad Request with validation errors if validation fails
12. API returns 404 Not Found if invoice doesn't exist
13. API returns 409 Conflict if invoice is not in DRAFT status

## Tasks / Subtasks

- [ ] Task 1: Implement UpdateInvoiceCommand and handler (AC: 1-9)
  - [ ] Create UpdateInvoiceCommand DTO with optional fields
  - [ ] Create UpdateInvoiceCommandHandler with @Transactional
  - [ ] Load existing invoice by ID (throw EntityNotFoundException if not found)
  - [ ] Validate invoice is in DRAFT status
  - [ ] Apply field-level validation for updated fields
  - [ ] If lineItems are updated: validate at least one line item
  - [ ] Update invoice domain entity
  - [ ] Recalculate totals
  - [ ] Save updated invoice via repository
  - [ ] Publish InvoiceUpdated domain event
- [ ] Task 2: Update Invoice domain entity (AC: 8)
  - [ ] Implement Invoice.update() method
  - [ ] Ensure calculations are recalculated on update
  - [ ] Handle line item updates (replace all line items)
  - [ ] Ensure audit info is updated on modification
- [ ] Task 3: Implement REST API endpoint (AC: 10-13)
  - [ ] Add PUT /api/v1/invoices/{id} endpoint to InvoiceController
  - [ ] Create UpdateInvoiceRequestDto with optional fields and validation
  - [ ] Map request DTO to command
  - [ ] Handle command execution
  - [ ] Map updated domain entity to InvoiceDetailDto response
  - [ ] Implement error handling for not found (404)
  - [ ] Implement error handling for validation errors (400)
  - [ ] Implement error handling for non-draft status (409)
- [ ] Task 4: Write integration tests (AC: All)
  - [ ] Test successful invoice update
  - [ ] Test update with single field
  - [ ] Test update with multiple fields
  - [ ] Test update line items
  - [ ] Test validation failures
  - [ ] Test invoice not found (404)
  - [ ] Test updating SENT invoice (409)
  - [ ] Test updating PAID invoice (409)
  - [ ] Test calculation accuracy after update

## Dev Notes

- Follow DDD patterns: Update operations modify aggregate root
- Only DRAFT invoices can be updated
- Line items are replaced entirely (not partially updated)
- Recalculate all totals after any update
- Follow Vertical Slice Architecture: features/invoices/commands/UpdateInvoice/
- Transaction boundary: Command handler method level
- Domain events: Publish InvoiceUpdated event after successful save

### Project Structure Notes

- Commands: `features/invoices/commands/UpdateInvoice/UpdateInvoiceCommand.java`
- API: `features/invoices/api/InvoiceController.java` (add PUT endpoint)
- DTOs: `features/invoices/dto/UpdateInvoiceRequestDto.java`

### References

- [Source: docs/epics/epic-2-invoice-domain.md#3.2.2 Invoice Commands & Validation]
- [Source: docs/epics/epic-4-backend-infrastructure.md#4.3.2 Invoice API]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

