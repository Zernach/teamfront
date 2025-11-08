# Story 1.3: Vertical Slice Architecture Setup

Status: drafted

## Story

As a backend developer,
I want to establish the Vertical Slice Architecture directory structure,
so that features are organized in self-contained slices with all layers (controller, command/query, handler) together.

## Acceptance Criteria

1. Directory structure created following VSA pattern
2. Domain layer organized (`domain/`)
3. Application layer organized (`application/`)
4. Features directory structure created (`features/`)
5. Infrastructure layer organized (`infrastructure/`)
6. API layer organized (`api/`)
7. Each feature slice contains controller/endpoint, command/query definitions, handler implementations
8. Integration test structure established per slice

## Tasks / Subtasks

- [ ] Task 1: Create base directory structure (AC: 1)
  - [ ] Create `src/main/java/com/rapidphotoupload/domain/`
  - [ ] Create `src/main/java/com/rapidphotoupload/application/`
  - [ ] Create `src/main/java/com/rapidphotoupload/features/`
  - [ ] Create `src/main/java/com/rapidphotoupload/infrastructure/`
  - [ ] Create `src/main/java/com/rapidphotoupload/api/`
- [ ] Task 2: Organize domain layer (AC: 2)
  - [ ] Create `domain/aggregates/`
  - [ ] Create `domain/valueobjects/`
  - [ ] Create `domain/events/`
  - [ ] Create `domain/repositories/` (interfaces only)
- [ ] Task 3: Organize application layer (AC: 3)
  - [ ] Create `application/commands/`
  - [ ] Create `application/queries/`
  - [ ] Create `application/dtos/`
  - [ ] Create `application/services/`
- [ ] Task 4: Create features directory structure (AC: 4)
  - [ ] Create example feature slice structure
  - [ ] Document feature slice pattern
  - [ ] Each slice: `features/{feature-name}/` with controller, commands, queries, handlers
- [ ] Task 5: Organize infrastructure layer (AC: 5)
  - [ ] Create `infrastructure/persistence/`
  - [ ] Create `infrastructure/storage/`
  - [ ] Create `infrastructure/events/`
  - [ ] Create `infrastructure/config/`
- [ ] Task 6: Organize API layer (AC: 6)
  - [ ] Create `api/controllers/`
  - [ ] Create `api/middleware/`
  - [ ] Create `api/dto/` (request/response DTOs)
- [ ] Task 7: Create example feature slice (AC: 7)
  - [ ] Create example feature: `features/photo-upload/`
  - [ ] Add controller/endpoint
  - [ ] Add command/query definitions
  - [ ] Add handler implementations
  - [ ] Document pattern for future features
- [ ] Task 8: Set up integration test structure (AC: 8)
  - [ ] Create `src/test/java/com/rapidphotoupload/features/`
  - [ ] Create example integration test per slice
  - [ ] Document testing pattern

## Dev Notes

- Vertical Slice Architecture groups by feature, not by layer
- Each feature slice is self-contained
- Features can share domain models and infrastructure
- Keep slices independent and testable

### Project Structure Notes

```
src/main/java/com/rapidphotoupload/
├── domain/          # Domain layer (DDD)
├── application/     # Application layer (CQRS)
├── features/        # Vertical slices
├── infrastructure/  # Infrastructure layer
└── api/            # API layer
```

Each feature slice:
```
features/{feature-name}/
├── {Feature}Controller.java
├── commands/
│   ├── {Feature}Command.java
│   └── handlers/
│       └── {Feature}CommandHandler.java
├── queries/
│   ├── {Feature}Query.java
│   └── handlers/
│       └── {Feature}QueryHandler.java
└── tests/
    └── {Feature}IntegrationTest.java
```

### References

- [Source: docs/epics/epic-1-backend-core.md#Vertical Slice Architecture]
- [Source: docs/PRD.md#Architecture Quality Indicators]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

