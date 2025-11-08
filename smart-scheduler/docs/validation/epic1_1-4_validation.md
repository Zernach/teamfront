# Story 1-4: Delete/Deactivate Contractor - Validation Guide

## 30-Second Quick Test

1. Start the backend: `cd backend && dotnet run`
2. Create a contractor (use Story 1-1 endpoint) and note the ID
3. DELETE `http://localhost:5000/api/contractors/{id}` - Should deactivate contractor
4. GET `http://localhost:5000/api/contractors` - Should not include deactivated contractor
5. POST `http://localhost:5000/api/contractors/{id}/restore` - Should restore contractor

## Automated Test Results

**Build Status:**
- ✅ Project compiles successfully
- ✅ All dependencies resolved

## Manual Validation Steps

### 1. Deactivate Contractor (Soft Delete)

**Command:**
```bash
# Create a contractor
CONTRACTOR=$(curl -X POST http://localhost:5000/api/contractors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "To Be Deleted",
    "type": 1,
    "phoneNumber": "555-1234",
    "email": "delete@example.com",
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

# Deactivate the contractor
curl -X DELETE http://localhost:5000/api/contractors/$CONTRACTOR_ID
```

**Expected Response (200 OK):**
```json
{
  "id": "<guid>",
  "success": true,
  "message": "Contractor deactivated successfully."
}
```

### 2. Verify Exclusion from List

```bash
# List contractors (should not include deactivated)
curl "http://localhost:5000/api/contractors"
```
Expected: Deactivated contractor not in results

### 3. Verify Exclusion from Get by ID

```bash
# Try to get deactivated contractor
curl "http://localhost:5000/api/contractors/$CONTRACTOR_ID"
```
Expected: Still returns contractor (soft delete, not hard delete)

### 4. Include Inactive Contractors (Admin)

```bash
# List contractors including inactive
curl "http://localhost:5000/api/contractors?includeInactive=true"
```
Expected: Deactivated contractor appears in results

### 5. Restore Contractor

```bash
# Restore the contractor
curl -X POST http://localhost:5000/api/contractors/$CONTRACTOR_ID/restore
```

**Expected Response (200 OK):**
```json
{
  "id": "<guid>",
  "success": true,
  "message": "Contractor restored successfully."
}
```

### 6. Verify Restoration

```bash
# List contractors (should now include restored contractor)
curl "http://localhost:5000/api/contractors"
```
Expected: Restored contractor appears in results

### 7. Test Invalid ID

```bash
curl -X DELETE http://localhost:5000/api/contractors/00000000-0000-0000-0000-000000000000
```
Expected: 404 Not Found

## Edge Cases & Error Handling

1. **Invalid ID**: Returns 404 Not Found
2. **Already Inactive**: Can be deactivated again (idempotent)
3. **Active Assignments**: Will prevent deactivation (when Assignments table exists)
4. **Restore Active Contractor**: Can restore already active contractor (idempotent)

## Database Verification

After deactivation, verify in database:
```sql
SELECT id, name, status FROM contractors WHERE id = '<guid>';
```
Expected: status = 2 (Inactive)

After restoration:
```sql
SELECT id, name, status FROM contractors WHERE id = '<guid>';
```
Expected: status = 1 (Active)

## Acceptance Criteria Checklist

- ✅ System performs soft delete (status = Inactive) instead of hard delete
- ⚠️ System prevents deletion of contractors with active assignments (placeholder - will be implemented when Assignments table exists)
- ✅ System excludes deleted contractors from searches by default
- ✅ System allows admin to restore deleted contractors
- ✅ System maintains audit trail of deletion (UpdatedAt timestamp updated)

## Files Modified

- `backend/Commands/DeactivateContractorCommand.cs` - Deactivate and restore commands
- `backend/Handlers/DeactivateContractorHandler.cs` - Deactivate and restore handlers
- `backend/Queries/ContractorQueries.cs` - Added IncludeInactive parameter
- `backend/Handlers/ContractorQueryHandlers.cs` - Filter inactive contractors
- `backend/Controllers/ContractorsController.cs` - DELETE and restore endpoints

## Notes

- Active assignment check is deferred (will be implemented when Assignments table exists)
- Soft delete preserves all data for audit purposes
- Restore functionality available for admin use
- Inactive contractors excluded from default searches but can be included with includeInactive=true

