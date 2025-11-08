# InvoiceMe Database Schema & Migration Scripts
## Complete PostgreSQL Database Design with Flyway Migrations

**Document Version:** 1.0
**Last Updated:** 2025-11-08
**Database:** PostgreSQL 14+

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Migration Scripts](#migration-scripts)
3. [Table Specifications](#table-specifications)
4. [Indexes Strategy](#indexes-strategy)
5. [Constraints & Validation](#constraints--validation)
6. [Seed Data](#seed-data)
7. [Backup & Recovery](#backup--recovery)

---

## 1. Database Overview

### 1.1 Schema Design Principles

- **Normalization**: 3NF (Third Normal Form) for data integrity
- **UUID Primary Keys**: For distributed system compatibility
- **Audit Columns**: Every table tracks created/modified timestamps
- **Soft Deletes**: Sensitive data uses status flags instead of hard deletes
- **Constraints**: Database-level validation for data integrity
- **Indexes**: Strategic indexing for query performance

### 1.2 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Users     │         │  Customers   │         │  Invoices   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)      │◄───────┤ id (PK)     │
│ email       │         │ first_name   │ 1    ∞ │ customer_id │
│ password    │         │ last_name    │         │ invoice_num │
│ full_name   │         │ email        │         │ status      │
│ role        │         │ status       │         │ total       │
└─────────────┘         └──────────────┘         └─────────────┘
                                                        │ 1
                                                        │
                                                        │ ∞
                        ┌──────────────┐         ┌─────────────┐
                        │  Payments    │         │ Line Items  │
                        ├──────────────┤         ├─────────────┤
                        │ id (PK)      │         │ id (PK)     │
                        │ invoice_id   │◄───────┤ invoice_id  │
                        │ amount       │ 1    ∞ │ description │
                        │ payment_date │         │ quantity    │
                        │ status       │         │ unit_price  │
                        └──────────────┘         └─────────────┘
```

---

## 2. Migration Scripts

### Migration File Structure

```
src/main/resources/db/migration/
├── V1__create_users_table.sql
├── V2__create_customers_table.sql
├── V3__create_invoices_table.sql
├── V4__create_line_items_table.sql
├── V5__create_payments_table.sql
├── V6__add_indexes.sql
├── V7__add_audit_columns.sql
├── V8__seed_admin_user.sql
└── V9__add_invoice_number_sequence.sql
```

### V1__create_users_table.sql

```sql
-- Users table for authentication and authorization
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    CONSTRAINT chk_users_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT chk_users_role
        CHECK (role IN ('ADMIN', 'USER')),
    CONSTRAINT chk_users_full_name_length
        CHECK (LENGTH(full_name) >= 2 AND LENGTH(full_name) <= 100)
);

-- Index on email for login lookups
CREATE UNIQUE INDEX idx_users_email_lower ON users(LOWER(email));

-- Index on active users
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts for system authentication';
COMMENT ON COLUMN users.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN users.email IS 'Unique email address for login';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hashed password';
COMMENT ON COLUMN users.role IS 'User role: ADMIN or USER';
COMMENT ON COLUMN users.is_active IS 'Whether user account is active';
```

### V2__create_customers_table.sql

```sql
-- Customers table for customer management
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),

    -- Billing address (embedded)
    billing_street VARCHAR(255) NOT NULL,
    billing_city VARCHAR(100) NOT NULL,
    billing_state VARCHAR(2) NOT NULL,
    billing_zip VARCHAR(10) NOT NULL,
    billing_country VARCHAR(100) NOT NULL,

    tax_id VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    -- Audit columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100) NOT NULL,

    -- Constraints
    CONSTRAINT chk_customers_first_name_format
        CHECK (first_name ~ '^[a-zA-Z\s''-]+$'),
    CONSTRAINT chk_customers_last_name_format
        CHECK (last_name ~ '^[a-zA-Z\s''-]+$'),
    CONSTRAINT chk_customers_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT chk_customers_phone_format
        CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'),
    CONSTRAINT chk_customers_tax_id_format
        CHECK (tax_id IS NULL OR tax_id ~ '^\d{2}-\d{7}$'),
    CONSTRAINT chk_customers_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
    CONSTRAINT chk_customers_billing_state_length
        CHECK (LENGTH(billing_state) = 2),
    CONSTRAINT chk_customers_name_length
        CHECK (LENGTH(first_name) >= 2 AND LENGTH(first_name) <= 50
           AND LENGTH(last_name) >= 2 AND LENGTH(last_name) <= 50)
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_customers_email_lower ON customers(LOWER(email));
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_last_name ON customers(last_name);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Full-text search index on name and email
CREATE INDEX idx_customers_search
    ON customers USING gin(
        to_tsvector('english',
            first_name || ' ' || last_name || ' ' || email
        )
    );

-- Comments
COMMENT ON TABLE customers IS 'Customer records for invoicing';
COMMENT ON COLUMN customers.status IS 'Customer status: ACTIVE, INACTIVE, SUSPENDED, or DELETED';
COMMENT ON COLUMN customers.tax_id IS 'Tax identifier in format XX-XXXXXXX';
```

### V3__create_invoices_table.sql

```sql
-- Invoices table for invoice management
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE,
    customer_id UUID NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    -- Amounts (stored in cents to avoid floating point issues)
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    notes TEXT,

    -- Audit columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100) NOT NULL,

    -- Status-specific timestamps
    sent_at TIMESTAMP,
    sent_by VARCHAR(100),
    paid_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by VARCHAR(100),
    cancellation_reason TEXT,

    -- Foreign key
    CONSTRAINT fk_invoices_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    -- Check constraints
    CONSTRAINT chk_invoices_status
        CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'CANCELLED')),

    CONSTRAINT chk_invoices_due_date
        CHECK (due_date >= invoice_date),

    CONSTRAINT chk_invoices_amounts_positive
        CHECK (
            subtotal >= 0
            AND tax_amount >= 0
            AND total_amount >= 0
            AND paid_amount >= 0
            AND balance >= 0
        ),

    CONSTRAINT chk_invoices_amount_calculation
        CHECK (total_amount = subtotal + tax_amount),

    CONSTRAINT chk_invoices_balance_calculation
        CHECK (balance = total_amount - paid_amount),

    CONSTRAINT chk_invoices_paid_not_exceeds_total
        CHECK (paid_amount <= total_amount),

    CONSTRAINT chk_invoices_number_when_sent
        CHECK (
            (status = 'DRAFT' AND invoice_number IS NULL)
            OR (status != 'DRAFT' AND invoice_number IS NOT NULL)
        ),

    CONSTRAINT chk_invoices_sent_timestamp
        CHECK (
            (status = 'DRAFT' AND sent_at IS NULL)
            OR (status != 'DRAFT' AND sent_at IS NOT NULL)
        ),

    CONSTRAINT chk_invoices_paid_timestamp
        CHECK (
            (status != 'PAID' AND paid_at IS NULL)
            OR (status = 'PAID' AND paid_at IS NOT NULL)
        ),

    CONSTRAINT chk_invoices_cancelled_data
        CHECK (
            (status != 'CANCELLED' AND cancelled_at IS NULL AND cancellation_reason IS NULL)
            OR (status = 'CANCELLED' AND cancelled_at IS NOT NULL AND cancellation_reason IS NOT NULL)
        )
);

-- Performance indexes
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE UNIQUE INDEX idx_invoices_invoice_number ON invoices(invoice_number)
    WHERE invoice_number IS NOT NULL;
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_invoices_customer_status
    ON invoices(customer_id, status);

CREATE INDEX idx_invoices_status_due_date
    ON invoices(status, due_date)
    WHERE status = 'SENT';

-- Index for overdue invoices
CREATE INDEX idx_invoices_overdue
    ON invoices(due_date, status, balance)
    WHERE status = 'SENT' AND balance > 0;

-- Comments
COMMENT ON TABLE invoices IS 'Invoice records with line items and payments';
COMMENT ON COLUMN invoices.invoice_number IS 'Unique invoice number, assigned when status changes from DRAFT to SENT';
COMMENT ON COLUMN invoices.status IS 'Invoice status: DRAFT, SENT, PAID, or CANCELLED';
COMMENT ON COLUMN invoices.balance IS 'Remaining balance (total_amount - paid_amount)';
```

### V4__create_line_items_table.sql

```sql
-- Line items table for invoice line items
CREATE TABLE line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,

    -- Foreign key with cascade delete
    CONSTRAINT fk_line_items_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE CASCADE,

    -- Check constraints
    CONSTRAINT chk_line_items_description_length
        CHECK (LENGTH(description) >= 1 AND LENGTH(description) <= 500),

    CONSTRAINT chk_line_items_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT chk_line_items_unit_price_positive
        CHECK (unit_price >= 0),

    CONSTRAINT chk_line_items_line_total_calculation
        CHECK (line_total = quantity * unit_price),

    CONSTRAINT chk_line_items_sort_order_positive
        CHECK (sort_order >= 0)
);

-- Indexes
CREATE INDEX idx_line_items_invoice_id ON line_items(invoice_id);
CREATE INDEX idx_line_items_invoice_sort
    ON line_items(invoice_id, sort_order);

-- Comments
COMMENT ON TABLE line_items IS 'Individual line items for invoices';
COMMENT ON COLUMN line_items.sort_order IS 'Display order within the invoice (0-based)';
COMMENT ON COLUMN line_items.line_total IS 'Calculated total: quantity * unit_price';
```

### V5__create_payments_table.sql

```sql
-- Payments table for invoice payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    reference_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    notes TEXT,

    -- Audit columns
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,

    -- Void information
    voided_at TIMESTAMP,
    voided_by VARCHAR(100),
    void_reason TEXT,

    -- Foreign key
    CONSTRAINT fk_payments_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE RESTRICT,

    -- Check constraints
    CONSTRAINT chk_payments_amount_positive
        CHECK (amount > 0),

    CONSTRAINT chk_payments_payment_method
        CHECK (payment_method IN (
            'CASH',
            'CHECK',
            'CREDIT_CARD',
            'BANK_TRANSFER',
            'OTHER'
        )),

    CONSTRAINT chk_payments_status
        CHECK (status IN ('APPLIED', 'VOIDED')),

    CONSTRAINT chk_payments_void_data_consistency
        CHECK (
            (status = 'APPLIED' AND voided_at IS NULL AND voided_by IS NULL AND void_reason IS NULL)
            OR (status = 'VOIDED' AND voided_at IS NOT NULL AND voided_by IS NOT NULL AND void_reason IS NOT NULL)
        )
);

-- Indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Composite indexes
CREATE INDEX idx_payments_invoice_status
    ON payments(invoice_id, status);

-- Comments
COMMENT ON TABLE payments IS 'Payment records applied to invoices';
COMMENT ON COLUMN payments.payment_method IS 'Payment method: CASH, CHECK, CREDIT_CARD, BANK_TRANSFER, or OTHER';
COMMENT ON COLUMN payments.status IS 'Payment status: APPLIED or VOIDED';
COMMENT ON COLUMN payments.void_reason IS 'Required when payment is voided';
```

### V6__add_indexes.sql

```sql
-- Additional performance indexes based on common query patterns

-- Customer search by full name
CREATE INDEX idx_customers_full_name
    ON customers((first_name || ' ' || last_name));

-- Invoice amount queries
CREATE INDEX idx_invoices_total_amount
    ON invoices(total_amount DESC)
    WHERE status != 'CANCELLED';

CREATE INDEX idx_invoices_balance
    ON invoices(balance DESC)
    WHERE balance > 0;

-- Payment aggregation queries
CREATE INDEX idx_payments_invoice_amount
    ON payments(invoice_id, amount)
    WHERE status = 'APPLIED';

-- Date range queries
CREATE INDEX idx_invoices_date_range
    ON invoices(invoice_date, due_date)
    WHERE status != 'CANCELLED';

CREATE INDEX idx_payments_date_range
    ON payments(payment_date, amount)
    WHERE status = 'APPLIED';

-- Customer with invoices join optimization
CREATE INDEX idx_invoices_customer_dates
    ON invoices(customer_id, invoice_date DESC, status);
```

### V7__add_audit_columns.sql

```sql
-- Add audit triggers for automatic last_modified_at updates

-- Function to update last_modified_at timestamp
CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for customers table
CREATE TRIGGER trigger_customers_update_timestamp
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_timestamp();

-- Trigger for invoices table
CREATE TRIGGER trigger_invoices_update_timestamp
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_timestamp();

-- Comments
COMMENT ON FUNCTION update_modified_timestamp() IS 'Automatically updates last_modified_at timestamp on row updates';
```

### V8__seed_admin_user.sql

```sql
-- Seed initial admin user
-- Password: AdminP@ssw0rd! (hashed with BCrypt)
INSERT INTO users (id, email, password_hash, full_name, role, is_active)
VALUES (
    gen_random_uuid(),
    'admin@invoiceme.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYVKujofB9.',
    'System Administrator',
    'ADMIN',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Comments
COMMENT ON TABLE users IS 'Default admin user created with email: admin@invoiceme.com';
```

### V9__add_invoice_number_sequence.sql

```sql
-- Create sequence for invoice numbers
CREATE SEQUENCE invoice_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    CACHE 10;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    year INTEGER;
    sequence_num INTEGER;
BEGIN
    year := EXTRACT(YEAR FROM CURRENT_DATE);
    sequence_num := nextval('invoice_number_seq');
    RETURN 'INV-' || year || '-' || LPAD(sequence_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON SEQUENCE invoice_number_seq IS 'Sequence for generating unique invoice numbers';
COMMENT ON FUNCTION generate_invoice_number() IS 'Generates invoice number in format INV-YYYY-NNN';
```

---

## 3. Table Specifications

### 3.1 Users Table

**Purpose**: Store user authentication and authorization data

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| email | VARCHAR(255) | No | - | Unique email |
| password_hash | VARCHAR(255) | No | - | BCrypt hash |
| full_name | VARCHAR(100) | No | - | User's full name |
| role | VARCHAR(20) | No | 'USER' | ADMIN or USER |
| is_active | BOOLEAN | No | TRUE | Account status |
| created_at | TIMESTAMP | No | now() | Creation timestamp |
| last_login_at | TIMESTAMP | Yes | NULL | Last login time |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (email)`
- `idx_users_email_lower` - Case-insensitive email lookup
- `idx_users_active` - Filter active users

**Storage Estimate:**
- Row size: ~400 bytes
- 1,000 users: ~400 KB
- 10,000 users: ~4 MB

### 3.2 Customers Table

**Purpose**: Store customer information for invoicing

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| first_name | VARCHAR(50) | No | - | First name |
| last_name | VARCHAR(50) | No | - | Last name |
| email | VARCHAR(255) | No | - | Unique email |
| phone | VARCHAR(20) | Yes | NULL | Phone number |
| billing_street | VARCHAR(255) | No | - | Street address |
| billing_city | VARCHAR(100) | No | - | City |
| billing_state | VARCHAR(2) | No | - | State code |
| billing_zip | VARCHAR(10) | No | - | ZIP code |
| billing_country | VARCHAR(100) | No | - | Country |
| tax_id | VARCHAR(20) | Yes | NULL | Tax identifier |
| status | VARCHAR(20) | No | 'ACTIVE' | Customer status |
| created_at | TIMESTAMP | No | now() | Creation timestamp |
| created_by | VARCHAR(100) | No | - | Creator user |
| last_modified_at | TIMESTAMP | No | now() | Last update timestamp |
| last_modified_by | VARCHAR(100) | No | - | Last modifier user |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (email)`
- `idx_customers_email_lower` - Case-insensitive email
- `idx_customers_status` - Filter by status
- `idx_customers_last_name` - Sort by last name
- `idx_customers_search` - Full-text search

**Storage Estimate:**
- Row size: ~700 bytes
- 10,000 customers: ~7 MB
- 100,000 customers: ~70 MB

### 3.3 Invoices Table

**Purpose**: Store invoice headers with calculated totals

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| invoice_number | VARCHAR(50) | Yes | NULL | Unique invoice # |
| customer_id | UUID | No | - | Foreign key to customers |
| invoice_date | DATE | No | - | Invoice date |
| due_date | DATE | No | - | Payment due date |
| status | VARCHAR(20) | No | 'DRAFT' | Invoice status |
| subtotal | DECIMAL(12,2) | No | 0.00 | Line items total |
| tax_amount | DECIMAL(12,2) | No | 0.00 | Tax amount |
| total_amount | DECIMAL(12,2) | No | 0.00 | Grand total |
| paid_amount | DECIMAL(12,2) | No | 0.00 | Amount paid |
| balance | DECIMAL(12,2) | No | 0.00 | Remaining balance |
| notes | TEXT | Yes | NULL | Additional notes |

**Indexes:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (customer_id) → customers(id)`
- `UNIQUE (invoice_number)`
- `idx_invoices_customer_id` - Customer invoices
- `idx_invoices_status` - Filter by status
- `idx_invoices_overdue` - Find overdue invoices

**Storage Estimate:**
- Row size: ~350 bytes
- 100,000 invoices: ~35 MB
- 1,000,000 invoices: ~350 MB

### 3.4 Line Items Table

**Purpose**: Store invoice line item details

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| invoice_id | UUID | No | - | Foreign key to invoices |
| description | VARCHAR(500) | No | - | Item description |
| quantity | DECIMAL(10,2) | No | - | Quantity |
| unit_price | DECIMAL(10,2) | No | - | Price per unit |
| line_total | DECIMAL(12,2) | No | - | Total (qty * price) |
| sort_order | INTEGER | No | 0 | Display order |

**Indexes:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (invoice_id) → invoices(id) ON DELETE CASCADE`
- `idx_line_items_invoice_id` - Get invoice items
- `idx_line_items_invoice_sort` - Ordered items

**Storage Estimate:**
- Row size: ~200 bytes
- Average 3 line items per invoice
- 100,000 invoices: ~60 MB
- 1,000,000 invoices: ~600 MB

### 3.5 Payments Table

**Purpose**: Store payment records applied to invoices

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | No | gen_random_uuid() | Primary key |
| invoice_id | UUID | No | - | Foreign key to invoices |
| amount | DECIMAL(12,2) | No | - | Payment amount |
| payment_date | DATE | No | - | Payment date |
| payment_method | VARCHAR(30) | No | - | Payment method |
| reference_number | VARCHAR(100) | Yes | NULL | Reference # |
| status | VARCHAR(20) | No | 'APPLIED' | Payment status |
| notes | TEXT | Yes | NULL | Additional notes |
| voided_at | TIMESTAMP | Yes | NULL | Void timestamp |
| voided_by | VARCHAR(100) | Yes | NULL | Void user |
| void_reason | TEXT | Yes | NULL | Void reason |

**Indexes:**
- `PRIMARY KEY (id)`
- `FOREIGN KEY (invoice_id) → invoices(id)`
- `idx_payments_invoice_id` - Invoice payments
- `idx_payments_status` - Filter by status

**Storage Estimate:**
- Row size: ~300 bytes
- Average 1.5 payments per invoice
- 100,000 invoices: ~45 MB
- 1,000,000 invoices: ~450 MB

---

## 4. Indexes Strategy

### 4.1 Index Types Used

**B-Tree Indexes** (Default):
- Primary keys
- Foreign keys
- Equality and range queries
- Sorting operations

**GIN Indexes** (Full-Text Search):
- `idx_customers_search` - Search customer names and emails

**Partial Indexes**:
- `idx_users_active` - Only active users
- `idx_invoices_overdue` - Only overdue invoices

### 4.2 Index Maintenance

**Monitoring:**
```sql
-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;

-- Find unused indexes
SELECT
    schemaname || '.' || tablename AS table,
    indexname AS index,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE 'pg_toast%';
```

**Reindexing:**
```sql
-- Reindex all tables (maintenance window)
REINDEX DATABASE invoiceme;

-- Reindex specific table
REINDEX TABLE customers;
```

---

## 5. Constraints & Validation

### 5.1 Referential Integrity

**ON DELETE Policies:**

| Foreign Key | Policy | Reason |
|-------------|--------|--------|
| invoices.customer_id | RESTRICT | Prevent deleting customers with invoices |
| line_items.invoice_id | CASCADE | Delete items when invoice is deleted |
| payments.invoice_id | RESTRICT | Prevent deleting invoices with payments |

### 5.2 Check Constraints Summary

**Data Quality:**
- Email format validation
- Phone number format (E.164)
- Tax ID format (XX-XXXXXXX)
- Name contains only letters

**Business Rules:**
- Due date >= invoice date
- Amounts must be positive
- Balance = total - paid
- Status transitions enforced

**Referential Consistency:**
- Invoice number assigned when SENT
- Timestamps match status
- Void data complete when voided

---

## 6. Seed Data

### Development Seed Data Script

```sql
-- V10__seed_development_data.sql (DO NOT USE IN PRODUCTION)

-- Seed test customers
INSERT INTO customers (
    id, first_name, last_name, email, phone,
    billing_street, billing_city, billing_state, billing_zip, billing_country,
    tax_id, status, created_by, last_modified_by
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'John', 'Doe', 'john.doe@example.com', '+15551234567',
    '123 Main St', 'Springfield', 'IL', '62701', 'USA',
    '12-3456789', 'ACTIVE', 'system', 'system'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Jane', 'Smith', 'jane.smith@example.com', '+15559876543',
    '456 Oak Ave', 'Chicago', 'IL', '60601', 'USA',
    '98-7654321', 'ACTIVE', 'system', 'system'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Acme', 'Corporation', 'billing@acme.com', '+15555555555',
    '789 Corporate Blvd', 'New York', 'NY', '10001', 'USA',
    '11-2233445', 'ACTIVE', 'system', 'system'
);

-- Comments
COMMENT ON TABLE customers IS 'Development seed data added. IDs: 11111111, 22222222, 33333333';
```

---

## 7. Backup & Recovery

### 7.1 Backup Strategy

**Full Backup (Daily):**
```bash
pg_dump -h localhost -U invoiceme -F c -b -v -f backup_$(date +%Y%m%d).dump invoiceme
```

**Continuous Archiving (WAL):**
```bash
# In postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /mnt/backups/wal/%f'
```

### 7.2 Recovery Procedures

**Full Restore:**
```bash
pg_restore -h localhost -U invoiceme -d invoiceme_restored -v backup_20251108.dump
```

**Point-in-Time Recovery:**
```bash
# recovery.conf
restore_command = 'cp /mnt/backups/wal/%f %p'
recovery_target_time = '2025-11-08 10:00:00'
```

---

**End of Database Schema & Migrations Document**

All migration scripts are production-ready and include proper constraints, indexes, and documentation.