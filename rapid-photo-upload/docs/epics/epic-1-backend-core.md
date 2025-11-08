# Epic 1: Backend Core

**Epic ID:** 1  
**Title:** Backend Core  
**Description:** Domain models, CQRS, VSA setup

## Overview

Establish the foundational backend architecture implementing Domain-Driven Design (DDD), Command Query Responsibility Segregation (CQRS), and Vertical Slice Architecture (VSA). This epic sets up the core domain models, infrastructure, and architectural patterns that all other features will build upon.

## Domain Models (DDD)

### Photo Aggregate
- `PhotoId` (Value Object): UUID, immutable
- `Filename` (Value Object): original filename, validation rules
- `FileSize` (Value Object): bytes, must be > 0
- `ContentType` (Value Object): MIME type (image/jpeg, image/png, etc.)
- `UploadStatus` (Enum): QUEUED, UPLOADING, COMPLETED, FAILED, CANCELLED
- `StorageKey` (Value Object): S3/Azure blob storage path
- `ThumbnailStorageKey` (Value Object): Optional thumbnail path
- `UploadedAt` (Value Object): ISO 8601 timestamp
- `UploadedBy` (Value Object): User reference
- `Metadata` (Entity Collection): Tags, dimensions, file hash, custom properties
- Domain Events: PhotoUploadStarted, PhotoUploadProgressed, PhotoUploadCompleted, PhotoUploadFailed

### UploadJob Aggregate
- `JobId` (Value Object): UUID
- `UserId` (Value Object): Reference to User
- `Photos` (Collection<PhotoId>): References to Photo aggregates
- `TotalPhotos`, `CompletedPhotos`, `FailedPhotos` (Value Objects)
- `JobStatus` (Enum): CREATED, IN_PROGRESS, COMPLETED, PARTIALLY_FAILED, FAILED
- `CreatedAt`, `CompletedAt` (Value Objects)
- `OverallProgress` (Calculated)
- Domain Events: UploadJobCreated, UploadJobProgressed, UploadJobCompleted, UploadJobFailed

### User Aggregate
- `UserId` (Value Object): UUID
- `Username` (Value Object): Unique, 3-50 chars
- `Email` (Value Object): Validated email format
- `PasswordHash` (Value Object): Bcrypt hashed
- `Roles` (Collection<Role>): USER, ADMIN
- `StorageQuota`, `UsedStorage` (Value Objects)
- `CreatedAt`, `LastLoginAt` (Value Objects)
- Domain Events: UserRegistered, UserLoggedIn, StorageQuotaExceeded

## CQRS Implementation

### Command Side Structure
- Command objects (UploadPhotoCommand, RetryFailedUploadCommand, CreateUploadJobCommand)
- Command handlers with validation and business logic
- Command results with success/failure status

### Query Side Structure
- Query objects (GetPhotoMetadataQuery, GetUploadJobStatusQuery, ListUserPhotosQuery)
- Query handlers optimized for read operations
- DTOs for data transfer (PhotoDTO, UploadJobDTO)
- Read-optimized views/materialized views

## Vertical Slice Architecture

### Directory Structure
```
src/main/java/com/rapidphotoupload/
├── domain/          # Domain layer (DDD)
├── application/     # Application layer (CQRS)
├── features/        # Vertical slices
├── infrastructure/  # Infrastructure layer
└── api/            # API layer
```

### Slice Organization
Each feature slice contains:
- Controller/Endpoint
- Command/Query definitions
- Handler implementations
- Integration tests

## Database Schema

### Core Tables
- `users` table with authentication and quota tracking
- `upload_jobs` table for batch upload tracking
- `photos` table for photo metadata
- `photo_tags` table for many-to-many tag relationships
- `photo_view` materialized view for optimized queries

## Infrastructure Setup

- PostgreSQL database configuration
- Cloud storage service interfaces (S3/Azure)
- Repository implementations
- Domain event publishing infrastructure
- Exception handling framework

## Acceptance Criteria

- [ ] Domain models implemented with proper value objects and invariants
- [ ] CQRS structure established with clear command/query separation
- [ ] Vertical slice architecture directory structure created
- [ ] Database schema created with migrations
- [ ] Repository interfaces defined
- [ ] Domain event infrastructure in place
- [ ] Basic error handling and validation framework

## Dependencies

- Spring Boot framework
- PostgreSQL database
- JPA/Hibernate for persistence
- Domain event library (Spring Events or custom)

## Related Epics

- Epic 2: Authentication & Authorization (builds on User aggregate)
- Epic 3: Upload API (implements upload commands/queries)
- Epic 4: Photo Query API (implements query handlers)

