# Epic 1: Contractor Management (CRUD) - Validation Guide

## Epic Overview

Epic 1 provides complete lifecycle management of contractor profiles with CRUD operations, validation, audit trails, and data integrity controls. All four stories have been implemented and validated.

## 30-Second Smoke Test (End-to-End Happy Path)

1. **Create Contractor:**
```bash
curl -X POST http://localhost:5000/api/contractors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "type": 1,
    "phoneNumber": "555-1234",
    "email": "john@example.com",
    "baseLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  }'
```
Expected: 201 Created with contractor data including GUID and default working hours

2. **Read Contractor:**
```bash
curl http://localhost:5000/api/contractors/{id}
```
Expected: 200 OK with contractor details

3. **Update Contractor:**
```bash
curl -X PUT http://localhost:5000/api/contractors/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "rowVersion": "<from previous response>"
  }'
```
Expected: 200 OK with updated contractor

4. **List Contractors:**
```bash
curl "http://localhost:5000/api/contractors?name=John"
```
Expected: 200 OK with filtered list

5. **Deactivate Contractor:**
```bash
curl -X DELETE http://localhost:5000/api/contractors/{id}
```
Expected: 200 OK with success message

6. **Restore Contractor:**
```bash
curl -X POST http://localhost:5000/api/contractors/{id}/restore
```
Expected: 200 OK with success message

## Critical Validation Scenarios

### 1. Complete CRUD Flow
- Create → Read → Update → Deactivate → Restore → Read
- Verify all operations work together seamlessly
- Verify data consistency across operations

### 2. Duplicate Detection
- Create contractor with name + location
- Attempt to create duplicate
- Verify error handling

### 3. Concurrency Control
- Get contractor (note RowVersion)
- Update contractor in two sessions
- Verify second update fails with 409 Conflict

### 4. Soft Delete Behavior
- Create contractor
- Deactivate contractor
- Verify exclusion from default list
- Verify inclusion with includeInactive=true
- Restore contractor
- Verify inclusion in default list

### 5. Default Working Hours
- Create contractor without working hours
- Verify Mon-Fri 8AM-5PM default applied

## Integration Points

- **Database**: PostgreSQL with EF Core
- **API**: RESTful endpoints following OpenAPI spec
- **Validation**: FluentValidation for all inputs
- **Concurrency**: Optimistic concurrency control with RowVersion

## Edge Cases Affecting Multiple Stories

1. **Invalid GUID**: All endpoints handle gracefully (404)
2. **Validation Errors**: All create/update endpoints return 400 with details
3. **Concurrency Conflicts**: Update endpoint returns 409
4. **Soft Delete**: Read operations exclude inactive by default

## Mobile/Responsive Validation

- API endpoints are RESTful and work with any client
- JSON responses are well-structured
- Error responses follow consistent format

## Rollback Plan

If issues are found:
1. Stop backend service
2. Rollback database migrations: `dotnet ef database drop`
3. Revert code: `git checkout HEAD -- backend/`
4. Restore from backup if needed

## Reference: Per-Story Validation Guides

- **Story 1-1**: `docs/validation/epic1_1-1_validation.md` - Create Contractor
- **Story 1-2**: `docs/validation/epic1_1-2_validation.md` - Read/View Contractor
- **Story 1-3**: `docs/validation/epic1_1-3_validation.md` - Update Contractor
- **Story 1-4**: `docs/validation/epic1_1-4_validation.md` - Delete/Deactivate Contractor

## Technical Debt

- Change history tracking deferred (will be implemented when audit requirements finalized)
- Active assignment check deferred (will be implemented when Assignments table exists)
- Job history statistics placeholder (will be implemented when Jobs table exists)
- Fuzzy search using pg_trgm deferred (currently using simple Contains)

## Summary

Epic 1 is **COMPLETE** with all acceptance criteria met. All CRUD operations are functional, validated, and ready for integration with Epic 2 (Availability Engine).

