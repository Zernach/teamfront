# Story 1.4: Get Customer by ID

Status: drafted

## Story

As a user,
I want to retrieve a customer's details by their ID,
so that I can view complete customer information including account summary.

## Acceptance Criteria

1. User can retrieve customer by ID
2. Customer must exist (404 if not found)
3. Response includes customer details: id, fullName, email, phone, billingAddress, taxId, status
4. Response includes account summary: totalInvoicesCount, totalInvoicedAmount, totalPaidAmount, outstandingBalance
5. Response includes audit info: createdAt, lastModifiedAt
6. API returns 200 OK with CustomerDetailDto on success
7. API returns 404 Not Found if customer doesn't exist
8. Query is read-only and optimized for performance

## Tasks / Subtasks

- [ ] Task 1: Implement GetCustomerByIdQuery and handler (AC: 1-5, 8)
  - [ ] Create GetCustomerByIdQuery DTO
  - [ ] Create GetCustomerByIdQueryHandler with @Transactional(readOnly = true)
  - [ ] Load customer by ID from repository
  - [ ] Calculate account summary metrics (aggregate from invoices)
  - [ ] Map domain entity to CustomerDetailDto
- [ ] Task 2: Implement account summary calculation (AC: 4)
  - [ ] Query invoices for customer
  - [ ] Calculate totalInvoicesCount (all invoices)
  - [ ] Calculate totalInvoicedAmount (sum of totalAmount from all invoices)
  - [ ] Calculate totalPaidAmount (sum of paidAmount from all invoices)
  - [ ] Calculate outstandingBalance (sum of balance from SENT invoices)
- [ ] Task 3: Implement REST API endpoint (AC: 6-7)
  - [ ] Add GET /api/v1/customers/{id} endpoint to CustomerController
  - [ ] Map path variable to query
  - [ ] Handle query execution
  - [ ] Map result to CustomerDetailDto response
  - [ ] Implement error handling for not found (404)
- [ ] Task 4: Create CustomerDetailDto (AC: 3-5)
  - [ ] Create CustomerDetailDto with all required fields
  - [ ] Use MapStruct for domain entity to DTO mapping
  - [ ] Include account summary fields
  - [ ] Include audit fields
- [ ] Task 5: Write integration tests (AC: All)
  - [ ] Test successful customer retrieval
  - [ ] Test customer not found (404)
  - [ ] Test account summary calculations with various invoice states
  - [ ] Test read-only transaction optimization

## Dev Notes

- Follow CQRS pattern: Query side is read-only
- Use @Transactional(readOnly = true) for query optimization
- Account summary should aggregate from invoice data
- Use MapStruct for efficient DTO mapping
- Follow Vertical Slice Architecture: features/customers/queries/GetCustomerById/
- Consider caching for frequently accessed customers

### Project Structure Notes

- Queries: `features/customers/queries/GetCustomerById/GetCustomerByIdQuery.java`
- API: `features/customers/api/CustomerController.java` (add GET endpoint)
- DTOs: `features/customers/dto/CustomerDetailDto.java`

### References

- [Source: docs/epics/epic-1-customer-domain.md#3.1.3 Customer Queries]
- [Source: docs/epics/epic-4-backend-infrastructure.md#4.3.1 Customer API]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

