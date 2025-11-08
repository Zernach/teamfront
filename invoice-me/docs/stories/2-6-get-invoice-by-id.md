# Story 2.6: Get Invoice by ID

Status: drafted

## Story

As a user,
I want to retrieve an invoice's details by its ID,
so that I can view complete invoice information including line items and payment history.

## Acceptance Criteria

1. User can retrieve invoice by ID
2. Invoice must exist (404 if not found)
3. Response includes invoice details: id, invoiceNumber, customer info, invoiceDate, dueDate, status, lineItems, subtotal, taxAmount, totalAmount, paidAmount, balance, notes
4. Response includes customer summary: id, fullName, email
5. Response includes line items with: id, description, quantity, unitPrice, lineTotal, sortOrder
6. Response includes payment history: list of PaymentSummaryDto
7. Response includes audit info: createdAt, lastModifiedAt, sentAt, paidAt
8. API returns 200 OK with InvoiceDetailDto on success
9. API returns 404 Not Found if invoice doesn't exist
10. Query is read-only and optimized for performance

## Tasks / Subtasks

- [ ] Task 1: Implement GetInvoiceByIdQuery and handler (AC: 1-7, 10)
  - [ ] Create GetInvoiceByIdQuery DTO
  - [ ] Create GetInvoiceByIdQueryHandler with @Transactional(readOnly = true)
  - [ ] Load invoice by ID from repository (with customer and payments)
  - [ ] Load line items for invoice
  - [ ] Load payment history for invoice
  - [ ] Map domain entities to InvoiceDetailDto
- [ ] Task 2: Implement repository query with joins (AC: 3-6, 10)
  - [ ] Use JOIN FETCH for customer to avoid N+1 queries
  - [ ] Use JOIN FETCH for line items
  - [ ] Load payments separately or with JOIN
  - [ ] Optimize query to load all data in single query where possible
- [ ] Task 3: Implement REST API endpoint (AC: 8-9)
  - [ ] Add GET /api/v1/invoices/{id} endpoint to InvoiceController
  - [ ] Map path variable to query
  - [ ] Handle query execution
  - [ ] Map result to InvoiceDetailDto response
  - [ ] Implement error handling for not found (404)
- [ ] Task 4: Create InvoiceDetailDto (AC: 3-7)
  - [ ] Create InvoiceDetailDto with all required fields
  - [ ] Create CustomerSummaryDto nested object
  - [ ] Create LineItemDto nested objects
  - [ ] Create PaymentSummaryDto nested objects
  - [ ] Use MapStruct for domain entity to DTO mapping
- [ ] Task 5: Write integration tests (AC: All)
  - [ ] Test successful invoice retrieval
  - [ ] Test invoice not found (404)
  - [ ] Test invoice with line items
  - [ ] Test invoice with payment history
  - [ ] Test query performance optimization

## Dev Notes

- Follow CQRS pattern: Query side is read-only
- Use @Transactional(readOnly = true) for query optimization
- Use JOIN FETCH to avoid N+1 query problems
- Load all related data efficiently in single query where possible
- Use MapStruct for efficient DTO mapping
- Follow Vertical Slice Architecture: features/invoices/queries/GetInvoiceById/
- Consider caching for frequently accessed invoices

### Project Structure Notes

- Queries: `features/invoices/queries/GetInvoiceById/GetInvoiceByIdQuery.java`
- API: `features/invoices/api/InvoiceController.java` (add GET endpoint)
- DTOs: `features/invoices/dto/InvoiceDetailDto.java`, `features/invoices/dto/LineItemDto.java`

### References

- [Source: docs/epics/epic-2-invoice-domain.md#3.2.3 Invoice Queries]
- [Source: docs/epics/epic-4-backend-infrastructure.md#4.3.2 Invoice API]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

