# Epic 1 Story 1-2 Validation Guide: CQRS Structure Setup

## 30-Second Quick Test

Run the test suite to verify CQRS structure compiles and passes tests:
```bash
cd backend && mvn clean test
```

Expected: All 62 tests pass (includes previous domain model tests + new CQRS structure tests)

## Automated Test Results

### Unit Tests
- **Total Tests**: 62
- **Passing**: 62
- **Failures**: 0
- **Coverage**: Commands, queries, DTOs, and handler interfaces tested

### Test Breakdown
- **Commands**: 4 tests
  - UploadPhotoCommand: 1 test
  - RetryFailedUploadCommand: 1 test
  - CreateUploadJobCommand: 2 tests (creation + validation)
- **CommandResult**: 3 tests
  - Success result: 1 test
  - Failure result: 2 tests (with/without cause)
- **Queries**: 4 tests
  - GetPhotoMetadataQuery: 1 test
  - GetUploadJobStatusQuery: 1 test
  - ListUserPhotosQuery: 2 tests (creation + validation)
- **DTOs**: 3 tests
  - PhotoDTO: 1 test
  - UploadJobDTO: 1 test
  - PhotoListDTO: 1 test

## Manual Validation Steps

### 1. Verify CQRS Structure Compiles

```bash
cd backend
mvn clean compile
```

### 2. Verify Command/Query Separation

Check that commands and queries are in separate packages:
```bash
ls -la backend/src/main/java/com/rapidphotoupload/application/commands/
ls -la backend/src/main/java/com/rapidphotoupload/application/queries/
```

Expected: Commands and queries are in separate directories

### 3. Verify Handler Interfaces

```bash
cat backend/src/main/java/com/rapidphotoupload/application/commands/handlers/CommandHandler.java
cat backend/src/main/java/com/rapidphotoupload/application/queries/handlers/QueryHandler.java
```

Expected: Both interfaces defined with proper type parameters

### 4. Verify DTOs Are Separate from Domain Models

```bash
grep -r "domain.aggregates\|domain.valueobjects" backend/src/main/java/com/rapidphotoupload/application/dtos/
```

Expected: DTOs use value objects but not aggregate internals directly

### 5. Test Command Validation

```java
// Test command validation
var userId = UserId.generate();
assertThrows(IllegalArgumentException.class, () -> {
    new CreateUploadJobCommand(userId, 0);
});
```

### 6. Test Query Validation

```java
// Test query validation
var userId = UserId.generate();
assertThrows(IllegalArgumentException.class, () -> {
    new ListUserPhotosQuery(userId, -1, 20);
});
```

## Edge Cases and Error Handling

### Command Validation
- ✅ Null values rejected in commands
- ✅ Invalid ranges rejected (totalPhotos > 100)
- ✅ CommandResult supports success and failure cases
- ✅ Failure results include error codes and messages

### Query Validation
- ✅ Null values rejected in queries
- ✅ Invalid pagination parameters rejected
- ✅ Default values applied (sortBy, sortOrder)
- ✅ Page size limits enforced (1-100)

### DTO Validation
- ✅ DTOs validate required fields
- ✅ DTOs use primitive types for API compatibility
- ✅ DTOs separate from domain model internals

## Acceptance Criteria Checklist

- [x] Command side structure established with command objects (UploadPhotoCommand, RetryFailedUploadCommand, CreateUploadJobCommand)
- [x] Command handlers implemented with validation and business logic (stub implementations, full logic in Epic 3)
- [x] Command results defined with success/failure status
- [x] Query side structure established with query objects (GetPhotoMetadataQuery, GetUploadJobStatusQuery, ListUserPhotosQuery)
- [x] Query handlers implemented optimized for read operations (stub implementations, full logic in Epic 4)
- [x] DTOs defined for data transfer (PhotoDTO, UploadJobDTO, PhotoListDTO)
- [x] Read-optimized views/materialized views planned (documented in docs/materialized-view-plan.md)

## Architecture Notes

### Command Side
- Commands represent intent to change state
- Command handlers process commands and return CommandResult
- CommandResult uses sealed interface pattern for type safety
- Handlers will be fully implemented in Epic 3

### Query Side
- Queries represent intent to read state
- Query handlers return Optional<T> for null safety
- DTOs used for data transfer, separate from domain models
- Materialized view plan documented for future optimization

### Separation of Concerns
- Commands and queries in separate packages
- DTOs separate from domain models
- Handler interfaces provide type safety
- No infrastructure dependencies in application layer

## Rollback Plan

If issues are discovered:
1. All code is in version control
2. Revert changes: `git checkout HEAD -- backend/src/main/java/com/rapidphotoupload/application/`
3. Re-run tests to verify clean state

## Files Modified

- `backend/src/main/java/com/rapidphotoupload/application/commands/*` - Command interfaces and implementations
- `backend/src/main/java/com/rapidphotoupload/application/commands/handlers/*` - Command handler interfaces and stubs
- `backend/src/main/java/com/rapidphotoupload/application/queries/*` - Query interfaces and implementations
- `backend/src/main/java/com/rapidphotoupload/application/queries/handlers/*` - Query handler interfaces and stubs
- `backend/src/main/java/com/rapidphotoupload/application/dtos/*` - Data Transfer Objects
- `backend/src/test/java/com/rapidphotoupload/application/**/*Test.java` - Test classes
- `docs/materialized-view-plan.md` - Materialized view design document

## Next Steps

Story 1-2 is complete. Ready to proceed to Story 1-3: Vertical Slice Architecture.

