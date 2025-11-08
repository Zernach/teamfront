# Story 1-3: Update Contractor - Validation Guide

## 30-Second Quick Test

1. Start the backend: `cd backend && dotnet run`
2. Create a contractor (use Story 1-1 endpoint) and note the ID and RowVersion
3. PUT to `http://localhost:5000/api/contractors/{id}` with updated data including RowVersion
4. Verify: Returns 200 OK with updated contractor data and new RowVersion

## Automated Test Results

**Build Status:**
- ✅ Project compiles successfully
- ✅ All dependencies resolved

## Manual Validation Steps

### 1. Update Contractor

**Command:**
```bash
# First, get a contractor to update
CONTRACTOR=$(curl -X POST http://localhost:5000/api/contractors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Original Name",
    "type": 1,
    "phoneNumber": "555-1234",
    "email": "original@example.com",
    "baseLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }')

CONTRACTOR_ID=$(echo $CONTRACTOR | jq -r '.id')
ROW_VERSION=$(echo $CONTRACTOR | jq -r '.rowVersion' | base64 -d | xxd -p | tr -d '\n')

# Update the contractor
curl -X PUT http://localhost:5000/api/contractors/$CONTRACTOR_ID \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Updated Name\",
    \"phoneNumber\": \"555-9999\",
    \"rowVersion\": \"$ROW_VERSION\"
  }"
```

**Expected Response (200 OK):**
```json
{
  "id": "<guid>",
  "name": "Updated Name",
  "type": 1,
  "rating": 0.00,
  "status": 1,
  "phoneNumber": "555-9999",
  "email": "original@example.com",
  "baseLocation": {...},
  "skills": [],
  "workingHours": [...],
  "createdAt": "<timestamp>",
  "updatedAt": "<newer timestamp>",
  "rowVersion": "<new row version>"
}
```

### 2. Test Partial Updates

```bash
# Update only email
curl -X PUT http://localhost:5000/api/contractors/$CONTRACTOR_ID \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"newemail@example.com\",
    \"rowVersion\": \"<current row version>\"
  }"
```
Expected: Only email is updated, other fields remain unchanged

### 3. Test Concurrency Conflict

```bash
# Get contractor twice
CONTRACTOR1=$(curl http://localhost:5000/api/contractors/$CONTRACTOR_ID)
CONTRACTOR2=$(curl http://localhost:5000/api/contractors/$CONTRACTOR_ID)

# Update with first RowVersion
curl -X PUT http://localhost:5000/api/contractors/$CONTRACTOR_ID \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"First Update\",
    \"rowVersion\": \"<row version from CONTRACTOR1>\"
  }"

# Try to update with second RowVersion (should fail)
curl -X PUT http://localhost:5000/api/contractors/$CONTRACTOR_ID \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Second Update\",
    \"rowVersion\": \"<row version from CONTRACTOR2>\"
  }"
```
Expected: First update succeeds (200), second update fails (409 Conflict)

### 4. Test Invalid ID

```bash
curl -X PUT http://localhost:5000/api/contractors/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```
Expected: 404 Not Found

### 5. Test Validation

```bash
curl -X PUT http://localhost:5000/api/contractors/$CONTRACTOR_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "invalid-email"
  }'
```
Expected: 400 Bad Request with validation errors

## Edge Cases & Error Handling

1. **Invalid ID**: Returns 404 Not Found
2. **Concurrency Conflict**: Returns 409 Conflict with descriptive message
3. **Validation Errors**: Returns 400 Bad Request with FluentValidation errors
4. **Partial Updates**: Only provided fields are updated
5. **ID Modification Attempt**: ID in URL takes precedence (cannot be changed)

## Acceptance Criteria Checklist

- ✅ All fields except ID are editable
- ✅ System validates all field updates
- ✅ System records UpdatedAt timestamp on changes
- ✅ System implements optimistic concurrency control
- ⚠️ System tracks change history (deferred - change history entity not yet implemented)

## Files Modified

- `backend/Models/Contractor.cs` - Added RowVersion property
- `backend/Commands/UpdateContractorCommand.cs` - Update command
- `backend/Handlers/UpdateContractorHandler.cs` - Update handler
- `backend/Validators/UpdateContractorCommandValidator.cs` - Validation rules
- `backend/Controllers/ContractorsController.cs` - PUT endpoint
- `backend/Data/ApplicationDbContext.cs` - RowVersion configuration

## Notes

- Change history tracking is deferred (will be implemented when audit requirements are finalized)
- RowVersion is managed automatically by EF Core
- Partial updates are supported (only provided fields are updated)
- Concurrency conflicts return 409 Conflict status

