# Vertical Slice Architecture Pattern

## Overview

This project follows Vertical Slice Architecture (VSA), where code is organized by feature rather than by technical layer. Each feature slice is self-contained and includes all layers needed for that feature.

## Directory Structure

```
src/main/java/com/rapidphotoupload/
├── domain/                    # Shared domain layer (DDD)
│   ├── aggregates/          # Domain aggregates
│   ├── valueobjects/         # Value objects
│   ├── events/              # Domain events
│   └── repositories/        # Repository interfaces (domain contracts)
│
├── application/              # Shared application layer (CQRS)
│   ├── commands/            # Command definitions
│   ├── queries/             # Query definitions
│   ├── dtos/                # Data Transfer Objects
│   └── services/            # Application services
│
├── features/                 # Vertical slices (feature-based)
│   └── {feature-name}/      # Each feature is a self-contained slice
│       ├── controller/      # REST controllers/endpoints
│       ├── commands/        # Feature-specific commands
│       ├── queries/         # Feature-specific queries
│       ├── handlers/        # Command/query handlers
│       └── dto/             # Feature-specific DTOs
│
├── infrastructure/          # Infrastructure implementations
│   ├── persistence/         # Database implementations
│   ├── storage/             # Cloud storage implementations
│   ├── events/              # Event publishing implementations
│   └── config/               # Configuration classes
│
└── api/                      # API layer
    ├── controllers/          # Top-level API controllers (if needed)
    ├── middleware/          # Cross-cutting concerns (auth, logging)
    └── dto/                  # API request/response DTOs
```

## Feature Slice Pattern

Each feature slice follows this structure:

```
features/{feature-name}/
├── controller/
│   └── {Feature}Controller.java    # REST endpoints
├── commands/
│   └── {Feature}Command.java       # Commands specific to this feature
├── queries/
│   └── {Feature}Query.java        # Queries specific to this feature
├── handlers/
│   ├── {Feature}CommandHandler.java
│   └── {Feature}QueryHandler.java
└── dto/
    └── {Feature}RequestDTO.java     # Request/response DTOs
```

## Example: Photo Upload Feature

The `features/photo-upload/` slice contains:
- Controller: Handles HTTP requests for photo uploads
- Commands: UploadPhotoCommand, CreateUploadJobCommand
- Queries: GetUploadJobStatusQuery
- Handlers: Process commands and queries
- DTOs: Request/response models

## Principles

1. **Self-Contained**: Each feature slice contains everything needed for that feature
2. **Shared Domain**: Domain models are shared across features
3. **Independent**: Features can be developed and tested independently
4. **Testable**: Each slice has its own integration tests

## Integration Tests

Integration tests are organized per feature:
```
src/test/java/com/rapidphotoupload/features/
└── {feature-name}/
    └── {Feature}IntegrationTest.java
```

Each integration test tests the full slice: controller → handler → repository → database.

## Benefits

1. **Feature Locality**: All code for a feature is in one place
2. **Easier Navigation**: Find feature code quickly
3. **Independent Development**: Teams can work on different features
4. **Clear Boundaries**: Features are clearly separated
5. **Easier Testing**: Test entire feature slices independently

## Migration Strategy

When adding a new feature:
1. Create feature directory: `features/{feature-name}/`
2. Add controller, commands, queries, handlers
3. Create integration test
4. Follow existing patterns from example features

