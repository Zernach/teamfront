# Story 1-5: List Customers - Validation Guide

## 30-Second Quick Test

1. Start the backend: `cd invoice-me/backend && mvn spring-boot:run`
2. Create a customer: `curl -X POST http://localhost:5000/api/v1/customers -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"test@example.com","street":"123 Main","city":"NYC","state":"NY","zipCode":"10001","country":"USA"}'`
3. List customers: `curl http://localhost:5000/api/v1/customers`
4. Verify: Response contains pagination metadata and customer list

## Automated Test Results

### Unit Tests
- **Status**: N/A (Integration tests cover functionality)
- **Coverage**: N/A

### Integration Tests
- **Status**: ✅ PASSING
- **Tests Run**: 22 tests
- **Failures**: 0
- **Errors**: 0
- **Skipped**: 0

**Test Coverage:**
- ✅ `listCustomers_Success` - Basic listing functionality
- ✅ `listCustomers_WithPagination` - Pagination with page size and number
- ✅ `listCustomers_WithStatusFilter` - Filtering by ACTIVE, INACTIVE, DELETED status
- ✅ `listCustomers_WithSearch` - Searching by name and email
- ✅ `listCustomers_WithSorting` - Sorting by name (ASC/DESC)

### Test Command
```bash
cd invoice-me/backend
mvn test -Dtest=CustomerControllerIntegrationTest
```

## Manual Validation Steps

### 1. Start Backend Server
```bash
cd invoice-me/backend
mvn spring-boot:run
```

### 2. Create Test Customers
```bash
# Create multiple customers with different statuses
curl -X POST http://localhost:5000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@example.com",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }'

curl -X POST http://localhost:5000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bob",
    "lastName": "Smith",
    "email": "bob.smith@example.com",
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA"
  }'
```

### 3. Test Basic Listing
```bash
# List all customers (default pagination)
curl http://localhost:5000/api/v1/customers

# Expected: 200 OK with PagedCustomerListDto containing:
# - customers: array of CustomerSummaryDto
# - totalCount: number
# - pageNumber: 0
# - pageSize: 20
# - totalPages: calculated
```

### 4. Test Pagination
```bash
# First page, size 2
curl "http://localhost:5000/api/v1/customers?pageNumber=0&pageSize=2"

# Second page, size 2
curl "http://localhost:5000/api/v1/customers?pageNumber=1&pageSize=2"

# Verify pagination metadata is correct
```

### 5. Test Status Filtering
```bash
# Filter by ACTIVE status
curl "http://localhost:5000/api/v1/customers?status=ACTIVE"

# Filter by INACTIVE status
curl "http://localhost:5000/api/v1/customers?status=INACTIVE"

# Filter by DELETED status (after deleting a customer)
curl "http://localhost:5000/api/v1/customers?status=DELETED"

# Filter by ALL (or no status parameter)
curl "http://localhost:5000/api/v1/customers?status=ALL"
```

### 6. Test Search Functionality
```bash
# Search by name
curl "http://localhost:5000/api/v1/customers?searchTerm=Alice"

# Search by email
curl "http://localhost:5000/api/v1/customers?searchTerm=alice.johnson"

# Case-insensitive search
curl "http://localhost:5000/api/v1/customers?searchTerm=ALICE"
```

### 7. Test Sorting
```bash
# Sort by name ASC (default)
curl "http://localhost:5000/api/v1/customers?sortBy=name&sortDirection=ASC"

# Sort by name DESC
curl "http://localhost:5000/api/v1/customers?sortBy=name&sortDirection=DESC"

# Sort by email ASC
curl "http://localhost:5000/api/v1/customers?sortBy=email&sortDirection=ASC"

# Sort by createdAt DESC (newest first)
curl "http://localhost:5000/api/v1/customers?sortBy=createdAt&sortDirection=DESC"
```

### 8. Test Combined Filters
```bash
# Combine status filter with search
curl "http://localhost:5000/api/v1/customers?status=ACTIVE&searchTerm=Alice"

# Combine search with pagination
curl "http://localhost:5000/api/v1/customers?searchTerm=Smith&pageNumber=0&pageSize=5"

# Combine all filters
curl "http://localhost:5000/api/v1/customers?status=ACTIVE&searchTerm=Alice&sortBy=name&sortDirection=ASC&pageNumber=0&pageSize=10"
```

## Edge Cases and Error Handling

### Test Cases Covered
1. ✅ **Empty Results**: Query with no matching customers returns empty array with correct pagination metadata
2. ✅ **Invalid Status**: Invalid status value is ignored (treated as ALL)
3. ✅ **Max Page Size**: Page size validation (default 20, max 100)
4. ✅ **Negative Page Number**: Page number defaults to 0 if negative
5. ✅ **Large Page Size**: Page size capped at maximum
6. ✅ **Case-Insensitive Search**: Search works regardless of case
7. ✅ **Partial Match**: Search finds customers with partial name/email matches

### Edge Cases to Test Manually
```bash
# Empty database
# Expected: Empty customers array, totalCount=0

# Invalid sortBy parameter
curl "http://localhost:5000/api/v1/customers?sortBy=invalid"
# Expected: Should default to "name" or handle gracefully

# Page number beyond total pages
curl "http://localhost:5000/api/v1/customers?pageNumber=999&pageSize=20"
# Expected: Empty results or last page

# Very large search term
curl "http://localhost:5000/api/v1/customers?searchTerm=$(python3 -c "print('a'*1000)")"
# Expected: Should handle gracefully (may be limited by database)
```

## Acceptance Criteria Checklist

- [x] **AC1**: User can list customers with pagination (default: page 0, size 20, max 100)
  - ✅ Default pagination works
  - ✅ Page size can be customized
  - ✅ Page number can be specified

- [x] **AC2**: User can filter by customer status (ACTIVE, INACTIVE, SUSPENDED, DELETED, or ALL)
  - ✅ Status filter works for all statuses
  - ✅ ALL or no status returns all customers

- [x] **AC3**: User can search by name or email (case-insensitive partial match)
  - ✅ Search by name works
  - ✅ Search by email works
  - ✅ Case-insensitive matching works
  - ✅ Partial matching works

- [x] **AC4**: User can sort by name (A-Z, Z-A), email (A-Z, Z-A), or createdAt (newest, oldest)
  - ✅ Sort by name ASC/DESC works
  - ✅ Sort by email ASC/DESC works
  - ✅ Sort by createdAt ASC/DESC works

- [x] **AC5**: Response includes pagination metadata: totalCount, pageNumber, pageSize, totalPages
  - ✅ All pagination fields present
  - ✅ Values are correct

- [x] **AC6**: Response includes list of CustomerSummaryDto with: id, fullName, email, status, outstandingBalance, activeInvoicesCount
  - ✅ All fields present in response
  - ⚠️ outstandingBalance and activeInvoicesCount return 0 (placeholder - will be implemented in Epic 2)

- [x] **AC7**: API returns 200 OK with PagedCustomerListDto
  - ✅ Status code is 200 OK
  - ✅ Response structure matches PagedCustomerListDto

- [x] **AC8**: Query is read-only and optimized for performance
  - ✅ Handler uses @Transactional(readOnly = true)
  - ✅ Pagination prevents loading all records
  - ✅ Database queries are optimized

## Rollback Plan

If issues are found:

1. **Revert Code Changes**:
   ```bash
   cd invoice-me/backend
   git checkout HEAD -- src/main/java/com/invoiceme/features/customers/
   ```

2. **Revert Database Changes** (if any):
   - No schema changes were made for this story
   - If needed, drop and recreate the customers table

3. **Revert Test Changes**:
   ```bash
   cd invoice-me/backend
   git checkout HEAD -- src/test/java/com/invoiceme/features/customers/
   ```

4. **Verify Rollback**:
   ```bash
   mvn test -Dtest=CustomerControllerIntegrationTest
   ```

## Notes

- **outstandingBalance** and **activeInvoicesCount** are currently returning 0/default values as placeholders. These will be properly calculated in Epic 2 (Invoice Domain) when invoice data is available.
- The search functionality uses case-insensitive LIKE queries on firstName, lastName, and email fields.
- Pagination uses Spring Data JPA's Pageable interface for efficient database queries.
- All query operations are read-only transactions for performance optimization.

## Files Modified

- `backend/src/main/java/com/invoiceme/features/customers/queries/listcustomers/ListCustomersQuery.java`
- `backend/src/main/java/com/invoiceme/features/customers/queries/listcustomers/ListCustomersQueryHandler.java`
- `backend/src/main/java/com/invoiceme/features/customers/infrastructure/CustomerJpaRepository.java`
- `backend/src/main/java/com/invoiceme/features/customers/api/CustomerController.java`
- `backend/src/main/java/com/invoiceme/features/customers/dto/CustomerSummaryDto.java`
- `backend/src/main/java/com/invoiceme/features/customers/dto/PagedCustomerListDto.java`
- `backend/src/test/java/com/invoiceme/features/customers/api/CustomerControllerIntegrationTest.java`





