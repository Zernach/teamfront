# Story 1.4: Database Schema and Migrations

Status: drafted

## Story

As a backend developer,
I want to create the database schema with migrations for core tables (users, upload_jobs, photos, photo_tags),
so that the system has a solid data persistence foundation.

## Acceptance Criteria

1. Database schema created with migrations
2. `users` table created with authentication and quota tracking columns
3. `upload_jobs` table created for batch upload tracking
4. `photos` table created for photo metadata
5. `photo_tags` table created for many-to-many tag relationships
6. `photo_view` materialized view created for optimized queries
7. Proper indexes created for performance
8. Foreign key relationships established
9. Migration files created and tested

## Tasks / Subtasks

- [ ] Task 1: Create users table migration (AC: 2)
  - [ ] Define users table schema (id, username, email, password_hash, roles, storage_quota, used_storage, created_at, last_login_at)
  - [ ] Add unique constraints on username and email
  - [ ] Add indexes on username and email
  - [ ] Create migration file
- [ ] Task 2: Create upload_jobs table migration (AC: 3)
  - [ ] Define upload_jobs table schema (id, user_id, total_photos, completed_photos, failed_photos, status, created_at, completed_at)
  - [ ] Add foreign key to users table
  - [ ] Add index on user_id
  - [ ] Add index on status
  - [ ] Create migration file
- [ ] Task 3: Create photos table migration (AC: 4)
  - [ ] Define photos table schema (id, user_id, filename, file_size, content_type, status, storage_key, thumbnail_storage_key, uploaded_at, metadata)
  - [ ] Add foreign key to users table
  - [ ] Add indexes on user_id, status, uploaded_at
  - [ ] Create migration file
- [ ] Task 4: Create photo_tags table migration (AC: 5)
  - [ ] Define photo_tags junction table (photo_id, tag_id)
  - [ ] Create tags table (id, name, created_at)
  - [ ] Add foreign keys to photos and tags
  - [ ] Add unique constraint on (photo_id, tag_id)
  - [ ] Add indexes
  - [ ] Create migration file
- [ ] Task 5: Create photo_view materialized view (AC: 6)
  - [ ] Define materialized view query joining photos, tags, users
  - [ ] Include aggregated tags
  - [ ] Add indexes on user_id, uploaded_at
  - [ ] Create migration file
- [ ] Task 6: Add performance indexes (AC: 7)
  - [ ] Review query patterns
  - [ ] Add composite indexes where needed
  - [ ] Add indexes for sorting operations
- [ ] Task 7: Establish foreign key relationships (AC: 8)
  - [ ] Verify all foreign keys are defined
  - [ ] Set up cascade rules where appropriate
  - [ ] Document relationships
- [ ] Task 8: Test migrations (AC: 9)
  - [ ] Test migration up
  - [ ] Test migration down
  - [ ] Verify schema matches requirements

## Dev Notes

- Use Flyway or Liquibase for migrations
- Ensure migrations are idempotent
- Indexes should support common query patterns
- Materialized view refresh strategy will be implemented later

### Project Structure Notes

- Migrations: `src/main/resources/db/migration/`
- Follow naming convention: `V{version}__{description}.sql`
- Keep migrations small and focused

### References

- [Source: docs/epics/epic-1-backend-core.md#Database Schema]
- [Source: docs/PRD.md#Database Design]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

