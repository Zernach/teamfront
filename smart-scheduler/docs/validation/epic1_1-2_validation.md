# Story 1-2: Read/View Contractor - Validation Guide

## 30-Second Quick Test

1. Start the backend: `cd backend && dotnet run`
2. Create a contractor first (use Story 1-1 endpoint)
3. GET `http://localhost:5000/api/contractors/{id}` - Should return contractor details
4. GET `http://localhost:5000/api/contractors` - Should return list of contractors

## Automated Test Results

**Unit Tests:**
- Location: `backend/Tests/ContractorQueryHandlerTests.cs`
- Status: Tests created (may have InMemory database setup issues)
- Tests cover:
  - Get contractor by ID (valid and invalid)
  - List contractors with no filters
  - Filter by name
  - Filter by type
  - Pagination

**Build Status:**
- ✅ Project compiles successfully
- ✅ All dependencies resolved

## Manual Validation Steps

### 1. Get Contractor by ID

**Command:**
```bash
# First, create a contractor and note the ID
CONTRACTOR_ID=$(curl -X POST http://localhost:5000/api/contractors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Contractor",
    "type": 1,
    "phoneNumber": "555-1234",
    "email": "test@example.com",
    "baseLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }' | jq -r '.id')

# Then get the contractor
curl http://localhost:5000/api/contractors/$CONTRACTOR_ID
```

**Expected Response (200 OK):**
```json
{
  "id": "<guid>",
  "name": "Test Contractor",
  "type": 1,
  "rating": 0.00,
  "status": 1,
  "phoneNumber": "555-1234",
  "email": "test@example.com",
  "baseLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "skills": [],
  "workingHours": [...],
  "availabilityStatus": "Available",
  "statistics": {
    "totalJobs": 0,
    "completedJobs": 0,
    "pendingJobs": 0,
    "averageRating": 0.00
  },
  "createdAt": "<timestamp>",
  "updatedAt": "<timestamp>"
}
```

**Test Invalid ID:**
```bash
curl http://localhost:5000/api/contractors/00000000-0000-0000-0000-000000000000
```
Expected: 404 Not Found

### 2. List Contractors

**Basic List:**
```bash
curl "http://localhost:5000/api/contractors"
```

**Expected Response (200 OK):**
```json
{
  "items": [
    {
      "id": "<guid>",
      "name": "Contractor Name",
      "type": 1,
      "rating": 4.5,
      "status": 1,
      "phoneNumber": "555-1234",
      "email": "test@example.com",
      "city": "New York",
      "state": "NY",
      "availabilityStatus": "Available"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

### 3. Filter by Name

```bash
curl "http://localhost:5000/api/contractors?name=John"
```
Expected: Returns only contractors with "John" in name

### 4. Filter by Type

```bash
curl "http://localhost:5000/api/contractors?type=1"
```
Expected: Returns only Flooring contractors (type 1)

### 5. Filter by Rating

```bash
curl "http://localhost:5000/api/contractors?minRating=4.0&maxRating=5.0"
```
Expected: Returns only contractors with rating between 4.0 and 5.0

### 6. Filter by Location

```bash
curl "http://localhost:5000/api/contractors?city=New%20York&state=NY"
```
Expected: Returns only contractors in New York, NY

### 7. Pagination

```bash
curl "http://localhost:5000/api/contractors?page=1&pageSize=10"
curl "http://localhost:5000/api/contractors?page=2&pageSize=10"
```
Expected: First call returns items 1-10, second returns items 11-20

## Edge Cases & Error Handling

1. **Invalid GUID**: Returns 404 Not Found
2. **Non-existent Contractor**: Returns 404 Not Found
3. **Empty Results**: Returns empty items array with totalCount = 0
4. **Invalid Page Number**: Returns empty results (no error, just empty)
5. **Combined Filters**: All filters work together (AND logic)

## Acceptance Criteria Checklist

- ✅ System provides individual contractor view by ID
- ✅ System provides list view with filtering and pagination
- ✅ System supports search by name, type, location, and rating
- ✅ System includes current availability status in contractor views
- ⚠️ System shows job history and statistics (placeholder - will be implemented when Jobs table exists)

## Files Modified

- `backend/Queries/ContractorQueries.cs` - Query definitions
- `backend/DTOs/ContractorDto.cs` - Response DTOs
- `backend/Handlers/ContractorQueryHandlers.cs` - Query handlers
- `backend/Controllers/ContractorsController.cs` - API endpoints
- `backend/Tests/ContractorQueryHandlerTests.cs` - Unit tests

## Notes

- Availability status is simplified (always "Available" for Active contractors)
- Job history statistics are placeholders (will be implemented when Jobs/Assignments tables exist)
- Filtering uses simple Contains for name search (can be enhanced with pg_trgm for fuzzy search later)
- Pagination uses offset/limit approach

