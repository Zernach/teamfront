# Story 2.7: List Invoices

Status: drafted

## Story

As a user,
I want to list invoices with filtering, searching, and pagination,
so that I can find and manage invoices efficiently.

## Acceptance Criteria

1. User can list invoices with pagination (default: page 0, size 20, max 100)
2. User can filter by customerId (optional)
3. User can filter by invoice status (DRAFT, SENT, PAID, CANCELLED, or ALL)
4. User can filter by date range (fromDate, toDate) based on invoiceDate
5. User can filter by overdue status (dueDate < today AND balance > 0 AND status = SENT)
6. User can sort by invoiceNumber, invoiceDate, dueDate, totalAmount, balance (ASC or DESC)
7. Response includes pagination metadata: totalCount, pageNumber, pageSize, totalPages
8. Response includes summary totals: totalAmountSum, totalBalanceSum
9. Response includes list of InvoiceSummaryDto with: id, invoiceNumber, customerName, invoiceDate, dueDate, status, totalAmount, balance, isOverdue
10. API returns 200 OK with PagedInvoiceListDto
11. Query is read-only and optimized for performance

## Tasks / Subtasks

- [ ] Task 1: Implement ListInvoicesQuery and handler (AC: 1-10, 11)
  - [ ] Create ListInvoicesQuery DTO with filters, sort, pagination
  - [ ] Create ListInvoicesQueryHandler with @Transactional(readOnly = true)
  - [ ] Build dynamic query based on filters
  - [ ] Apply customerId filter if provided
  - [ ] Apply status filter if provided
  - [ ] Apply date range filter if provided
  - [ ] Apply overdue filter if provided
  - [ ] Apply sorting based on sortBy and sortDirection
  - [ ] Apply pagination
  - [ ] Count total results for pagination metadata
  - [ ] Calculate summary totals (totalAmountSum, totalBalanceSum)
- [ ] Task 2: Implement repository query methods (AC: 2-6)
  - [ ] Add findByCustomerId method to InvoiceRepository
  - [ ] Add findByStatus method
  - [ ] Add findByDateRange method
  - [ ] Add findOverdue method
  - [ ] Add sorting support in repository queries
  - [ ] Use JPA Specification or QueryDSL for dynamic queries
- [ ] Task 3: Implement REST API endpoint (AC: 10)
  - [ ] Add GET /api/v1/invoices endpoint to InvoiceController
  - [ ] Accept query parameters: customerId, status, fromDate, toDate, overdue, sortBy, sortDirection, pageNumber, pageSize
  - [ ] Map query parameters to ListInvoicesQuery
  - [ ] Handle query execution
  - [ ] Map results to PagedInvoiceListDto response
- [ ] Task 4: Create DTOs (AC: 9)
  - [ ] Create InvoiceSummaryDto with required fields
  - [ ] Create PagedInvoiceListDto with list, pagination metadata, and summary totals
  - [ ] Use MapStruct for domain entity to DTO mapping
- [ ] Task 5: Calculate overdue status (AC: 5, 9)
  - [ ] Determine isOverdue: dueDate < today AND balance > 0 AND status = SENT
  - [ ] Include isOverdue flag in InvoiceSummaryDto
- [ ] Task 6: Write integration tests (AC: All)
  - [ ] Test pagination
  - [ ] Test customerId filtering
  - [ ] Test status filtering
  - [ ] Test date range filtering
  - [ ] Test overdue filtering
  - [ ] Test sorting
  - [ ] Test combination of filters
  - [ ] Test summary totals calculation
  - [ ] Test empty results
  - [ ] Test max page size validation

## Dev Notes

- Follow CQRS pattern: Query side is read-only
- Use @Transactional(readOnly = true) for query optimization
- Use JPA Specification or QueryDSL for dynamic query building
- Consider database indexes for filter and sort fields
- Pagination should be efficient (avoid loading all records)
- Overdue calculation should be done in database query for performance
- Follow Vertical Slice Architecture: features/invoices/queries/ListInvoices/
- Consider caching for frequently accessed invoice lists

### Project Structure Notes

- Queries: `features/invoices/queries/ListInvoices/ListInvoicesQuery.java`
- API: `features/invoices/api/InvoiceController.java` (add GET endpoint)
- DTOs: `features/invoices/dto/InvoiceSummaryDto.java`, `features/invoices/dto/PagedInvoiceListDto.java`

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

