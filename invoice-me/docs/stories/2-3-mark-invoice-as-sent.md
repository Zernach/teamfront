# Story 2.3: Mark Invoice as Sent

Status: drafted

## Story

As a user,
I want to mark a draft invoice as sent,
so that the invoice becomes immutable and gets an invoice number assigned.

## Acceptance Criteria

1. User can mark a DRAFT invoice as SENT
2. Invoice must exist (404 if not found)
3. Invoice must be in DRAFT status (409 Conflict if not draft)
4. Invoice must have at least one line item
5. Invoice number is auto-generated and assigned (format: INV-YYYY-NNNN)
6. Invoice number is unique across all invoices
7. Sent date defaults to current date if not provided
8. Invoice status changes from DRAFT to SENT
9. Invoice becomes immutable after being sent (cannot be edited)
10. Sent operation is audited with sentAt timestamp and user
11. API returns 200 OK with updated InvoiceDetailDto on success
12. API returns 404 Not Found if invoice doesn't exist
13. API returns 409 Conflict if invoice is not in DRAFT status

## Tasks / Subtasks

- [ ] Task 1: Implement invoice number generation (AC: 5-6)
  - [ ] Create InvoiceNumberGenerator service
  - [ ] Generate format: INV-YYYY-NNNN (e.g., INV-2025-0001)
  - [ ] Ensure uniqueness by checking existing invoice numbers
  - [ ] Handle year rollover (reset sequence at start of year)
  - [ ] Use database sequence or atomic counter for uniqueness
- [ ] Task 2: Implement MarkInvoiceAsSentCommand and handler (AC: 1-10)
  - [ ] Create MarkInvoiceAsSentCommand DTO with optional sentDate
  - [ ] Create MarkInvoiceAsSentCommandHandler with @Transactional
  - [ ] Load existing invoice by ID (throw EntityNotFoundException if not found)
  - [ ] Validate invoice is in DRAFT status
  - [ ] Validate invoice has at least one line item
  - [ ] Generate and assign invoice number
  - [ ] Set sent date (default to current date if not provided)
  - [ ] Update invoice status to SENT
  - [ ] Save updated invoice via repository
  - [ ] Publish InvoiceMarkedAsSent domain event
- [ ] Task 3: Update Invoice domain entity (AC: 8-9)
  - [ ] Implement Invoice.markAsSent() method
  - [ ] Ensure invoice number is immutable after assignment
  - [ ] Ensure invoice becomes immutable after status change
  - [ ] Update audit info with sentAt and sentBy
- [ ] Task 4: Implement REST API endpoint (AC: 11-13)
  - [ ] Add POST /api/v1/invoices/{id}/send endpoint to InvoiceController
  - [ ] Create MarkAsSentRequestDto with optional sentDate
  - [ ] Map request to command
  - [ ] Handle command execution
  - [ ] Map updated domain entity to InvoiceDetailDto response
  - [ ] Implement error handling for not found (404)
  - [ ] Implement error handling for non-draft status (409)
- [ ] Task 5: Write integration tests (AC: All)
  - [ ] Test successful invoice send
  - [ ] Test invoice number generation and uniqueness
  - [ ] Test invoice not found (404)
  - [ ] Test sending non-draft invoice (409)
  - [ ] Test sending invoice with no line items (should fail)
  - [ ] Test year rollover scenario

## Dev Notes

- Follow DDD patterns: Status transition is a domain operation
- Invoice number generation must be thread-safe and unique
- Use database sequence or atomic counter for invoice number generation
- Invoice becomes immutable after being sent
- Follow Vertical Slice Architecture: features/invoices/commands/MarkInvoiceAsSent/
- Transaction boundary: Command handler method level
- Domain events: Publish InvoiceMarkedAsSent event after successful save

### Project Structure Notes

- Commands: `features/invoices/commands/MarkInvoiceAsSent/MarkInvoiceAsSentCommand.java`
- Services: `features/invoices/services/InvoiceNumberGenerator.java`
- API: `features/invoices/api/InvoiceController.java` (add POST /send endpoint)
- DTOs: `features/invoices/dto/MarkAsSentRequestDto.java`

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

