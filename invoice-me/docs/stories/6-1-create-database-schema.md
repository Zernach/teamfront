# Story 6.1: Create Database Schema and Migrations

Status: drafted

## Story

As a developer,
I want to create the database schema with proper migrations,
so that the database structure is versioned and can be deployed consistently.

## Acceptance Criteria

1. Customers table is created with all required columns, constraints, and indexes
2. Invoices table is created with all required columns, constraints, and indexes
3. Line items table is created with foreign key to invoices
4. Payments table is created with foreign key to invoices
5. Users table is created for authentication
6. All tables have proper primary keys (UUID)
7. All foreign key constraints are defined
8. All check constraints are defined (status enums, date validations, amount validations)
9. All indexes are created for performance (email, status, dates, etc.)
10. Migrations are versioned using Flyway or Liquibase
11. Migration files follow naming convention: V{version}__{description}.sql
12. Database schema matches the domain model specifications

## Tasks / Subtasks

- [ ] Task 1: Create customers table migration (AC: 1, 6-9)
  - [ ] Create V1__create_customers_table.sql
  - [ ] Define all columns with proper types and constraints
  - [ ] Add unique constraint on email
  - [ ] Add check constraint on status enum
  - [ ] Add check constraint on email format
  - [ ] Create indexes: email, status, last_name
  - [ ] Add audit columns: created_at, created_by, last_modified_at, last_modified_by
- [ ] Task 2: Create invoices table migration (AC: 2, 6-9)
  - [ ] Create V2__create_invoices_table.sql
  - [ ] Define all columns with proper types and constraints
  - [ ] Add foreign key constraint to customers table
  - [ ] Add unique constraint on invoice_number
  - [ ] Add check constraints: status enum, due_date >= invoice_date, amount validations
  - [ ] Create indexes: customer_id, status, invoice_number, invoice_date, due_date, overdue
  - [ ] Add audit columns and status-specific columns (sent_at, paid_at, cancelled_at)
- [ ] Task 3: Create line items table migration (AC: 3, 6-9)
  - [ ] Create V3__create_line_items_table.sql
  - [ ] Define all columns with proper types and constraints
  - [ ] Add foreign key constraint to invoices table with CASCADE delete
  - [ ] Add check constraints: quantity > 0, unit_price >= 0, line_total = quantity * unit_price
  - [ ] Create indexes: invoice_id, sort_order
- [ ] Task 4: Create payments table migration (AC: 4, 6-9)
  - [ ] Create V4__create_payments_table.sql
  - [ ] Define all columns with proper types and constraints
  - [ ] Add foreign key constraint to invoices table
  - [ ] Add check constraints: amount > 0, payment_method enum, status enum
  - [ ] Create indexes: invoice_id, payment_date, status
  - [ ] Add audit columns and void-specific columns
- [ ] Task 5: Create users table migration (AC: 5, 6-9)
  - [ ] Create V5__create_users_table.sql
  - [ ] Define all columns with proper types and constraints
  - [ ] Add unique constraint on email
  - [ ] Add check constraint on role enum
  - [ ] Create index on email
- [ ] Task 6: Configure migration tool (AC: 10-11)
  - [ ] Configure Flyway or Liquibase in application.yml
  - [ ] Set up migration directory: db/migration/
  - [ ] Ensure migrations run on application startup
  - [ ] Test migration execution
- [ ] Task 7: Write integration tests (AC: 12)
  - [ ] Test migration execution
  - [ ] Test table creation
  - [ ] Test constraints enforcement
  - [ ] Test indexes creation
  - [ ] Test foreign key relationships

## Dev Notes

- Use Flyway or Liquibase for database versioning
- All monetary amounts use DECIMAL(12, 2) for precision
- All UUIDs use PostgreSQL UUID type
- Use proper indexes for query performance
- Foreign keys ensure referential integrity
- Check constraints enforce business rules at database level
- CASCADE delete for line items when invoice is deleted

### Project Structure Notes

- Migrations: `src/main/resources/db/migration/`
- Migration files: `V1__create_customers_table.sql`, `V2__create_invoices_table.sql`, etc.

### References

- [Source: docs/epics/epic-6-database-schema.md#6.1 PostgreSQL Schema]
- [Source: docs/epics/epic-6-database-schema.md#6.2 Database Migration Strategy]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

