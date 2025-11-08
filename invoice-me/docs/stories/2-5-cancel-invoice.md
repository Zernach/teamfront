# Story 2.5: Cancel Invoice

Status: drafted

## Story

As a user,
I want to cancel an invoice,
so that I can void invoices that are no longer valid.

## Acceptance Criteria

1. User can cancel an invoice with a cancellation reason
2. Invoice must exist (404 if not found)
3. Cannot cancel PAID invoices (409 Conflict)
4. Cannot cancel invoices with recorded payments (must void payments first) (409 Conflict)
5. Cancellation reason is required
6. Invoice status changes to CANCELLED
7. Cancelled invoices cannot be modified or have payments applied
8. Cancellation is permanent and irreversible
9. Cancellation operation is audited with cancelledAt timestamp, cancelledBy user, and cancellationReason
10. API returns 200 OK with updated InvoiceDetailDto on success
11. API returns 404 Not Found if invoice doesn't exist
12. API returns 409 Conflict if invoice cannot be cancelled

## Tasks / Subtasks

- [ ] Task 1: Implement CancelInvoiceCommand and handler (AC: 1-9)
  - [ ] Create CancelInvoiceCommand DTO with cancellationReason
  - [ ] Create CancelInvoiceCommandHandler with @Transactional
  - [ ] Load existing invoice by ID (throw EntityNotFoundException if not found)
  - [ ] Validate invoice is not PAID
  - [ ] Validate invoice has no applied payments (check PaymentRepository)
  - [ ] Validate cancellation reason is provided
  - [ ] Update invoice status to CANCELLED
  - [ ] Set cancellation audit fields (cancelledAt, cancelledBy, cancellationReason)
  - [ ] Save updated invoice via repository
  - [ ] Publish InvoiceCancelled domain event
- [ ] Task 2: Update Invoice domain entity (AC: 6-7)
  - [ ] Implement Invoice.cancel() method
  - [ ] Ensure cancelled invoices cannot be modified
  - [ ] Ensure cancelled invoices cannot have payments applied
  - [ ] Update audit info with cancellation details
- [ ] Task 3: Implement REST API endpoint (AC: 10-12)
  - [ ] Add POST /api/v1/invoices/{id}/cancel endpoint to InvoiceController
  - [ ] Create CancelInvoiceRequestDto with cancellationReason (required)
  - [ ] Map request to command
  - [ ] Handle command execution
  - [ ] Map updated domain entity to InvoiceDetailDto response
  - [ ] Implement error handling for not found (404)
  - [ ] Implement error handling for cannot cancel (409)
- [ ] Task 4: Write integration tests (AC: All)
  - [ ] Test successful invoice cancellation
  - [ ] Test invoice not found (404)
  - [ ] Test cancelling PAID invoice (409)
  - [ ] Test cancelling invoice with payments (409)
  - [ ] Test cancellation reason required
  - [ ] Test cancelled invoice cannot be modified
  - [ ] Test cancelled invoice cannot have payments applied

## Dev Notes

- Follow DDD patterns: Status transition is a domain operation
- Cancellation is permanent and irreversible
- Business rule: Cannot cancel invoices with payments (must void payments first)
- Business rule: Cannot cancel PAID invoices
- Follow Vertical Slice Architecture: features/invoices/commands/CancelInvoice/
- Transaction boundary: Command handler method level
- Domain events: Publish InvoiceCancelled event after successful cancellation

### Project Structure Notes

- Commands: `features/invoices/commands/CancelInvoice/CancelInvoiceCommand.java`
- API: `features/invoices/api/InvoiceController.java` (add POST /cancel endpoint)
- DTOs: `features/invoices/dto/CancelInvoiceRequestDto.java`

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

