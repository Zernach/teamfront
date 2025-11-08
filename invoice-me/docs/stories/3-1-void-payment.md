# Story 3.1: Void Payment

Status: drafted

## Story

As a user,
I want to void a payment,
so that I can reverse incorrectly recorded payments.

## Acceptance Criteria

1. User can void a payment with a void reason
2. Payment must exist (404 if not found)
3. Payment must have APPLIED status (409 Conflict if already voided)
4. Void reason is required
5. Payment status changes from APPLIED to VOIDED
6. Voiding payment increases invoice balance
7. If invoice was PAID, voiding payment changes status back to SENT
8. Voided payments cannot be re-applied (create new payment instead)
9. Void operation is audited with voidedAt timestamp, voidedBy user, and voidReason
10. API returns 200 OK with updated PaymentDetailDto on success
11. API returns 404 Not Found if payment doesn't exist
12. API returns 409 Conflict if payment is already voided

## Tasks / Subtasks

- [ ] Task 1: Implement VoidPaymentCommand and handler (AC: 1-9)
  - [ ] Create VoidPaymentCommand DTO with voidReason
  - [ ] Create VoidPaymentCommandHandler with @Transactional
  - [ ] Load existing payment by ID (throw EntityNotFoundException if not found)
  - [ ] Validate payment has APPLIED status
  - [ ] Validate void reason is provided
  - [ ] Load associated invoice
  - [ ] Update payment status to VOIDED
  - [ ] Reverse payment on invoice (increase balance, decrease paidAmount)
  - [ ] Update invoice status to SENT if it was PAID
  - [ ] Save payment and invoice via repositories
  - [ ] Publish PaymentVoided domain event
- [ ] Task 2: Update Payment domain entity (AC: 5, 8)
  - [ ] Implement Payment.void() method
  - [ ] Ensure voided payments cannot be re-applied
  - [ ] Update audit info with void details
- [ ] Task 3: Update Invoice domain entity (AC: 6-7)
  - [ ] Implement Invoice.reversePayment() method
  - [ ] Increase balance and decrease paidAmount
  - [ ] Update status to SENT if balance > 0 and was PAID
- [ ] Task 4: Implement REST API endpoint (AC: 10-12)
  - [ ] Add POST /api/v1/payments/{id}/void endpoint to PaymentController
  - [ ] Create VoidPaymentRequestDto with voidReason (required)
  - [ ] Map request to command
  - [ ] Handle command execution
  - [ ] Map updated domain entity to PaymentDetailDto response
  - [ ] Implement error handling for not found (404)
  - [ ] Implement error handling for already voided (409)
- [ ] Task 5: Write integration tests (AC: All)
  - [ ] Test successful payment void
  - [ ] Test payment not found (404)
  - [ ] Test voiding already voided payment (409)
  - [ ] Test void reason required
  - [ ] Test invoice balance increases after void
  - [ ] Test invoice status changes from PAID to SENT when payment voided

## Dev Notes

- Follow DDD patterns: Void operation modifies both Payment and Invoice aggregates
- Void operation reverses the payment effect on invoice balance
- Business rule: Cannot void already voided payments
- Business rule: Voiding payment on PAID invoice changes status back to SENT
- Follow Vertical Slice Architecture: features/payments/commands/VoidPayment/
- Transaction boundary: Command handler method level
- Domain events: Publish PaymentVoided event after successful void

### Project Structure Notes

- Commands: `features/payments/commands/VoidPayment/VoidPaymentCommand.java`
- API: `features/payments/api/PaymentController.java` (add POST /void endpoint)
- DTOs: `features/payments/dto/VoidPaymentRequestDto.java`

### References

- [Source: docs/epics/epic-3-payment-domain.md#3.3.2 Payment Commands & Validation]
- [Source: docs/epics/epic-4-backend-infrastructure.md#4.3.3 Payment API]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

