# Story 2.4: Record Payment for Invoice

Status: drafted

## Story

As a user,
I want to record a payment against a sent invoice,
so that I can track payments and update invoice balance.

## Acceptance Criteria

1. User can record a payment for an invoice with amount, paymentDate, paymentMethod, referenceNumber (optional), notes (optional)
2. Invoice must exist (404 if not found)
3. Invoice must be in SENT status (409 Conflict if not sent)
4. Payment amount must be > 0
5. Payment amount cannot exceed invoice balance
6. Payment date cannot be before invoice date
7. Payment method must be one of: CASH, CHECK, CREDIT_CARD, BANK_TRANSFER, OTHER
8. Payment is created with APPLIED status
9. Payment reduces invoice balance: balance = totalAmount - paidAmount
10. If payment amount equals balance, invoice status changes to PAID
11. Multiple partial payments are allowed
12. Payment operation is audited with created timestamp and user
13. API returns 201 Created with PaymentDetailDto on success
14. API returns 400 Bad Request with validation errors if validation fails
15. API returns 404 Not Found if invoice doesn't exist
16. API returns 409 Conflict if invoice is not in SENT status
17. API returns 422 Unprocessable Entity if payment exceeds balance

## Tasks / Subtasks

- [ ] Task 1: Implement Payment domain entity (AC: 8)
  - [ ] Create Payment aggregate root
  - [ ] Implement PaymentMethod enum
  - [ ] Implement PaymentStatus enum (APPLIED, VOIDED)
  - [ ] Implement Payment.create() factory method
- [ ] Task 2: Implement RecordPaymentForInvoiceCommand and handler (AC: 1-12)
  - [ ] Create RecordPaymentForInvoiceCommand DTO
  - [ ] Create RecordPaymentForInvoiceCommandHandler with @Transactional
  - [ ] Load existing invoice by ID (throw EntityNotFoundException if not found)
  - [ ] Validate invoice is in SENT status
  - [ ] Validate payment amount > 0
  - [ ] Validate payment amount <= invoice balance
  - [ ] Validate payment date >= invoice date
  - [ ] Create Payment domain entity
  - [ ] Apply payment to invoice (update paidAmount and balance)
  - [ ] Update invoice status to PAID if balance = 0
  - [ ] Save payment and invoice via repositories
  - [ ] Publish PaymentRecorded and InvoicePaymentRecorded domain events
- [ ] Task 3: Update Invoice domain entity (AC: 9-10)
  - [ ] Implement Invoice.applyPayment() method
  - [ ] Update paidAmount and balance
  - [ ] Update status to PAID if balance reaches zero
- [ ] Task 4: Implement PaymentRepository interface and implementation (AC: 1)
  - [ ] Create PaymentRepository interface in domain layer
  - [ ] Create PaymentEntity JPA entity
  - [ ] Create PaymentJpaRepository interface
  - [ ] Implement PaymentRepositoryImpl with mapping
  - [ ] Add foreign key constraint to invoices table
- [ ] Task 5: Implement REST API endpoint (AC: 13-17)
  - [ ] Add POST /api/v1/invoices/{id}/payments endpoint to InvoiceController
  - [ ] Create RecordPaymentRequestDto with validation annotations
  - [ ] Map request DTO to command
  - [ ] Handle command execution
  - [ ] Map domain entity to PaymentDetailDto response
  - [ ] Implement error handling for validation errors (400)
  - [ ] Implement error handling for not found (404)
  - [ ] Implement error handling for non-sent status (409)
  - [ ] Implement error handling for payment exceeds balance (422)
- [ ] Task 6: Write integration tests (AC: All)
  - [ ] Test successful payment recording
  - [ ] Test partial payment
  - [ ] Test full payment (status changes to PAID)
  - [ ] Test multiple partial payments
  - [ ] Test validation failures
  - [ ] Test invoice not found (404)
  - [ ] Test recording payment for non-sent invoice (409)
  - [ ] Test payment exceeds balance (422)
  - [ ] Test payment date before invoice date (400)

## Dev Notes

- Follow DDD patterns: Payment is an aggregate root, but closely related to Invoice
- Use SERIALIZABLE transaction isolation for payment recording to prevent race conditions
- Payment amount validation must check current invoice balance (not stale data)
- Multiple partial payments are supported
- Follow Vertical Slice Architecture: features/invoices/commands/RecordPaymentForInvoice/
- Use BigDecimal for all monetary calculations
- Transaction boundary: Command handler method level
- Domain events: Publish PaymentRecorded and InvoicePaymentRecorded events

### Project Structure Notes

- Commands: `features/invoices/commands/RecordPaymentForInvoice/RecordPaymentForInvoiceCommand.java`
- Domain: `features/payments/domain/Payment.java`
- Infrastructure: `features/payments/infrastructure/PaymentEntity.java`
- API: `features/invoices/api/InvoiceController.java` (add POST /payments endpoint)
- DTOs: `features/invoices/dto/RecordPaymentRequestDto.java`, `features/payments/dto/PaymentDetailDto.java`

### References

- [Source: docs/epics/epic-2-invoice-domain.md#3.2.2 Invoice Commands & Validation]
- [Source: docs/epics/epic-3-payment-domain.md#3.3.1 Payment Entity]
- [Source: docs/epics/epic-4-backend-infrastructure.md#4.3.2 Invoice API]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

