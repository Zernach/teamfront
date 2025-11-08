# Epic 6: Database Schema & Migrations

**Source:** PRD-InvoiceMe-Detailed.md - Section 6  
**Date:** 2025-11-08

---

## 6. Database Schema

### 6.1 PostgreSQL Schema

#### 6.1.1 Customers Table

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    billing_street VARCHAR(255) NOT NULL,
    billing_city VARCHAR(100) NOT NULL,
    billing_state VARCHAR(2) NOT NULL,
    billing_zip VARCHAR(10) NOT NULL,
    billing_country VARCHAR(100) NOT NULL,
    tax_id VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100) NOT NULL,

    CONSTRAINT chk_customer_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_last_name ON customers(last_name);
```

#### 6.1.2 Invoices Table

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100) NOT NULL,
    sent_at TIMESTAMP,
    sent_by VARCHAR(100),
    paid_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by VARCHAR(100),
    cancellation_reason TEXT,

    CONSTRAINT chk_invoice_status CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'CANCELLED')),
    CONSTRAINT chk_due_date CHECK (due_date >= invoice_date),
    CONSTRAINT chk_amounts CHECK (
        subtotal >= 0 AND
        tax_amount >= 0 AND
        total_amount >= 0 AND
        paid_amount >= 0 AND
        balance >= 0 AND
        total_amount = subtotal + tax_amount AND
        balance = total_amount - paid_amount
    )
);

CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_overdue ON invoices(due_date, status) WHERE status = 'SENT' AND due_date < CURRENT_DATE;
```

#### 6.1.3 Line Items Table

```sql
CREATE TABLE line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT chk_quantity CHECK (quantity > 0),
    CONSTRAINT chk_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_line_total CHECK (line_total = quantity * unit_price)
);

CREATE INDEX idx_line_items_invoice_id ON line_items(invoice_id);
CREATE INDEX idx_line_items_sort_order ON line_items(invoice_id, sort_order);
```

#### 6.1.4 Payments Table

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    reference_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    voided_at TIMESTAMP,
    voided_by VARCHAR(100),
    void_reason TEXT,

    CONSTRAINT chk_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER')),
    CONSTRAINT chk_payment_status CHECK (status IN ('APPLIED', 'VOIDED'))
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
```

#### 6.1.5 Users Table (Authentication)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    CONSTRAINT chk_user_role CHECK (role IN ('ADMIN', 'USER'))
);

CREATE INDEX idx_users_email ON users(email);
```

### 6.2 Database Migration Strategy

**Use Flyway or Liquibase for versioned migrations:**

```
db/migration/
├── V1__create_customers_table.sql
├── V2__create_invoices_table.sql
├── V3__create_line_items_table.sql
├── V4__create_payments_table.sql
├── V5__create_users_table.sql
└── V6__add_indexes.sql
```

---

