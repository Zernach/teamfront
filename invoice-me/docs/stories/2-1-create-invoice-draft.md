# Story 2.1: Create Invoice (Draft)

Status: drafted

## Story

As a user,
I want to create a new invoice as a draft with line items,
so that I can prepare invoices before sending them to customers.

## Acceptance Criteria

1. User can create an invoice with customerId, invoiceDate, dueDate, lineItems, taxAmount (optional), notes (optional)
2. Customer must exist and be ACTIVE (404 if customer not found, 409 if inactive)
3. Invoice must have at least one line item
4. Each line item must have description (1-500 chars), quantity (> 0, max 2 decimals), unitPrice (>= 0)
5. Invoice date cannot be in the future
6. Due date must be >= invoice date
7. Tax amount must be >= 0 (defaults to 0 if not provided)
8. Invoice is created with DRAFT status
9. Invoice number is null until invoice is sent
10. Line totals are calculated: lineTotal = quantity * unitPrice
11. Subtotal is calculated: subtotal = SUM(lineItems.lineTotal)
12. Total amount is calculated: totalAmount = subtotal + taxAmount
13. Balance equals totalAmount initially (paidAmount = 0)
14. API returns 201 Created with InvoiceDetailDto on success
15. API returns 400 Bad Request with validation errors if validation fails
16. API returns 404 Not Found if customer doesn't exist
17. API returns 409 Conflict if customer is inactive

## Tasks / Subtasks

- [ ] Task 1: Implement Invoice domain entity (AC: 1, 8-13)
  - [ ] Create Invoice aggregate root
  - [ ] Create LineItem value object
  - [ ] Implement InvoiceStatus enum (DRAFT, SENT, PAID, CANCELLED)
  - [ ] Implement Invoice.create() factory method
  - [ ] Implement calculation methods for subtotal, totalAmount, balance
  - [ ] Ensure invoice starts in DRAFT status
- [ ] Task 2: Implement CreateInvoiceCommand and handler (AC: 1-13)
  - [ ] Create CreateInvoiceCommand DTO
  - [ ] Create CreateInvoiceCommandHandler with @Transactional
  - [ ] Validate customer exists and is ACTIVE
  - [ ] Validate invoice date (not in future)
  - [ ] Validate due date (>= invoice date)
  - [ ] Validate at least one line item exists
  - [ ] Validate each line item (description, quantity, unitPrice)
  - [ ] Create Invoice domain entity with line items
  - [ ] Calculate totals
  - [ ] Save invoice via repository
  - [ ] Publish InvoiceCreated domain event
- [ ] Task 3: Implement InvoiceRepository interface and implementation (AC: 1)
  - [ ] Create InvoiceRepository interface in domain layer
  - [ ] Create InvoiceEntity JPA entity
  - [ ] Create LineItemEntity JPA entity
  - [ ] Create InvoiceJpaRepository interface
  - [ ] Implement InvoiceRepositoryImpl with mapping
  - [ ] Add foreign key constraint to customers table
- [ ] Task 4: Implement REST API endpoint (AC: 14-17)
  - [ ] Create InvoiceController with POST /api/v1/invoices endpoint
  - [ ] Create CreateInvoiceRequestDto with validation annotations
  - [ ] Map request DTO to command
  - [ ] Handle command execution
  - [ ] Map domain entity to InvoiceDetailDto response
  - [ ] Implement error handling for validation errors (400)
  - [ ] Implement error handling for customer not found (404)
  - [ ] Implement error handling for inactive customer (409)
- [ ] Task 5: Write integration tests (AC: All)
  - [ ] Test successful invoice creation
  - [ ] Test validation failures (no line items, invalid dates, etc.)
  - [ ] Test customer not found (404)
  - [ ] Test inactive customer (409)
  - [ ] Test calculation accuracy

## Dev Notes

- Follow DDD patterns: Invoice is an aggregate root, LineItem is a value object
- Invoice calculations must be precise (use BigDecimal for money)
- Invoice starts in DRAFT status and can be edited
- Invoice number is assigned when invoice is sent (separate story)
- Follow Vertical Slice Architecture: features/invoices/commands/CreateInvoice/
- Use BigDecimal for all monetary calculations
- Transaction boundary: Command handler method level
- Domain events: Publish InvoiceCreated event after successful save

### Project Structure Notes

- Backend structure: `src/main/java/com/invoiceme/features/invoices/`
- Commands: `commands/CreateInvoice/CreateInvoiceCommand.java`
- Domain: `domain/Invoice.java`, `domain/LineItem.java`
- Infrastructure: `infrastructure/InvoiceEntity.java`, `infrastructure/LineItemEntity.java`
- API: `api/InvoiceController.java`
- DTOs: `dto/CreateInvoiceRequestDto.java`, `dto/InvoiceDetailDto.java`

### References

- [Source: docs/epics/epic-2-invoice-domain.md#3.2.1 Invoice Entity]
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

