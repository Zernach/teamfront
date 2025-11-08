# Story 1.5: List Customers

Status: drafted

## Story

As a user,
I want to list customers with filtering, searching, and pagination,
so that I can find and manage customers efficiently.

## Acceptance Criteria

1. User can list customers with pagination (default: page 0, size 20, max 100)
2. User can filter by customer status (ACTIVE, INACTIVE, SUSPENDED, DELETED, or ALL)
3. User can search by name or email (case-insensitive partial match)
4. User can sort by name (A-Z, Z-A), email (A-Z, Z-A), or createdAt (newest, oldest)
5. Response includes pagination metadata: totalCount, pageNumber, pageSize, totalPages
6. Response includes list of CustomerSummaryDto with: id, fullName, email, status, outstandingBalance, activeInvoicesCount
7. API returns 200 OK with PagedCustomerListDto
8. Query is read-only and optimized for performance

## Tasks / Subtasks

- [ ] Task 1: Implement ListCustomersQuery and handler (AC: 1-5, 8)
  - [ ] Create ListCustomersQuery DTO with filters, search, sort, pagination
  - [ ] Create ListCustomersQueryHandler with @Transactional(readOnly = true)
  - [ ] Build dynamic query based on filters
  - [ ] Apply search term to name and email fields
  - [ ] Apply sorting based on sortBy and sortDirection
  - [ ] Apply pagination
  - [ ] Count total results for pagination metadata
- [ ] Task 2: Implement repository query methods (AC: 2-4)
  - [ ] Add findByStatus method to CustomerRepository
  - [ ] Add searchByNameOrEmail method
  - [ ] Add sorting support in repository queries
  - [ ] Use JPA Specification or QueryDSL for dynamic queries
- [ ] Task 3: Implement REST API endpoint (AC: 7)
  - [ ] Add GET /api/v1/customers endpoint to CustomerController
  - [ ] Accept query parameters: status, searchTerm, sortBy, sortDirection, pageNumber, pageSize
  - [ ] Map query parameters to ListCustomersQuery
  - [ ] Handle query execution
  - [ ] Map results to PagedCustomerListDto response
- [ ] Task 4: Create DTOs (AC: 6)
  - [ ] Create CustomerSummaryDto with required fields
  - [ ] Create PagedCustomerListDto with list and pagination metadata
  - [ ] Use MapStruct for domain entity to DTO mapping
- [ ] Task 5: Calculate outstanding balance and active invoices count (AC: 6)
  - [ ] Aggregate outstandingBalance from invoices (SENT status)
  - [ ] Count activeInvoicesCount (invoices with status SENT)
  - [ ] Optimize with JOIN queries or separate aggregation
- [ ] Task 6: Write integration tests (AC: All)
  - [ ] Test pagination
  - [ ] Test status filtering
  - [ ] Test search functionality
  - [ ] Test sorting
  - [ ] Test combination of filters
  - [ ] Test empty results
  - [ ] Test max page size validation

## Dev Notes

- Follow CQRS pattern: Query side is read-only
- Use @Transactional(readOnly = true) for query optimization
- Use JPA Specification or QueryDSL for dynamic query building
- Consider database indexes for search and filter fields
- Pagination should be efficient (avoid loading all records)
- Follow Vertical Slice Architecture: features/customers/queries/ListCustomers/
- Consider caching for frequently accessed customer lists

### Project Structure Notes

- Queries: `features/customers/queries/ListCustomers/ListCustomersQuery.java`
- API: `features/customers/api/CustomerController.java` (add GET endpoint)
- DTOs: `features/customers/dto/CustomerSummaryDto.java`, `features/customers/dto/PagedCustomerListDto.java`

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

