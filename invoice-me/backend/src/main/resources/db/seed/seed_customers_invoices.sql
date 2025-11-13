-- Seed data for Customers and Invoices (idempotent)
-- Safe to run multiple times (uses ON CONFLICT to avoid duplicates)
-- Target DB: PostgreSQL 14+ (AWS RDS)
-- Note: This script only seeds customers and invoices (no line items or payments)

BEGIN;

-- ============================
-- Customers
-- ============================
INSERT INTO customers (
    id, first_name, last_name, email, phone,
    billing_street, billing_city, billing_state, billing_zip, billing_country,
    tax_id, status, created_by, last_modified_by
) VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'John', 'Doe', 'john.doe@example.com', '+15551234567',
        '123 Main St', 'Springfield', 'IL', '62701', 'USA',
        '12-3456789', 'ACTIVE', 'seed-script', 'seed-script'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Jane', 'Smith', 'jane.smith@example.com', '+15559876543',
        '456 Oak Ave', 'Chicago', 'IL', '60601', 'USA',
        '98-7654321', 'ACTIVE', 'seed-script', 'seed-script'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Acme', 'Corporation', 'billing@acme.com', '+15555555555',
        '789 Corporate Blvd', 'New York', 'NY', '10001', 'USA',
        '11-2233445', 'ACTIVE', 'seed-script', 'seed-script'
    )
ON CONFLICT (email) DO NOTHING;

-- ============================
-- Invoices
-- ============================
-- Conventions:
-- - DRAFT: invoice_number IS NULL, sent_at IS NULL
-- - SENT: invoice_number NOT NULL, sent_at NOT NULL
-- - PAID: SENT + paid_at NOT NULL and paid_amount = total_amount, balance = 0
-- - CANCELLED: SENT + cancelled_at and cancellation_reason NOT NULL

-- 1) John Doe - DRAFT
INSERT INTO invoices (
    id, invoice_number, customer_id, invoice_date, due_date, status,
    subtotal, tax_amount, total_amount, paid_amount, balance, notes,
    created_by, last_modified_by, sent_at, sent_by, paid_at, cancelled_at, cancelled_by, cancellation_reason
) VALUES (
    '44444444-4444-4444-4444-444444444441',
    NULL,
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE + INTERVAL '16 days',
    'DRAFT',
    1200.00, 120.00, 1320.00, 0.00, 1320.00,
    'Website redesign (draft)',
    'seed-script', 'seed-script',
    NULL, NULL, NULL, NULL, NULL, NULL
) ON CONFLICT (id) DO NOTHING;

-- 2) John Doe - SENT
INSERT INTO invoices (
    id, invoice_number, customer_id, invoice_date, due_date, status,
    subtotal, tax_amount, total_amount, paid_amount, balance, notes,
    created_by, last_modified_by, sent_at, sent_by
) VALUES (
    '44444444-4444-4444-4444-444444444442',
    'INV-TEST-0001',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE - INTERVAL '21 days',
    CURRENT_DATE - INTERVAL '1 days',
    'SENT',
    200.00, 20.00, 220.00, 0.00, 220.00,
    'Logo refresh and brand palette',
    'seed-script', 'seed-script',
    CURRENT_TIMESTAMP - INTERVAL '7 days', 'seed-script'
) ON CONFLICT (id) DO NOTHING;

-- 3) Jane Smith - PAID
INSERT INTO invoices (
    id, invoice_number, customer_id, invoice_date, due_date, status,
    subtotal, tax_amount, total_amount, paid_amount, balance, notes,
    created_by, last_modified_by, sent_at, sent_by, paid_at
) VALUES (
    '55555555-5555-5555-5555-555555555551',
    'INV-TEST-0002',
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '10 days',
    'PAID',
    600.00, 60.00, 660.00, 660.00, 0.00,
    'Mobile app onboarding flow',
    'seed-script', 'seed-script',
    CURRENT_TIMESTAMP - INTERVAL '20 days', 'seed-script',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
) ON CONFLICT (id) DO NOTHING;

-- 4) Acme Corporation - CANCELLED
INSERT INTO invoices (
    id, invoice_number, customer_id, invoice_date, due_date, status,
    subtotal, tax_amount, total_amount, paid_amount, balance, notes,
    created_by, last_modified_by, sent_at, sent_by, cancelled_at, cancelled_by, cancellation_reason
) VALUES (
    '66666666-6666-6666-6666-666666666661',
    'INV-TEST-0003',
    '33333333-3333-3333-3333-333333333333',
    CURRENT_DATE - INTERVAL '40 days',
    CURRENT_DATE - INTERVAL '15 days',
    'CANCELLED',
    1000.00, 100.00, 1100.00, 0.00, 1100.00,
    'Enterprise analytics setup (cancelled)',
    'seed-script', 'seed-script',
    CURRENT_TIMESTAMP - INTERVAL '25 days', 'seed-script',
    CURRENT_TIMESTAMP - INTERVAL '5 days', 'seed-script', 'Project postponed by client'
) ON CONFLICT (id) DO NOTHING;

-- 5) Acme Corporation - SENT
INSERT INTO invoices (
    id, invoice_number, customer_id, invoice_date, due_date, status,
    subtotal, tax_amount, total_amount, paid_amount, balance, notes,
    created_by, last_modified_by, sent_at, sent_by
) VALUES (
    '77777777-7777-7777-7777-777777777771',
    'INV-TEST-0004',
    '33333333-3333-3333-3333-333333333333',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '25 days',
    'SENT',
    320.00, 32.00, 352.00, 0.00, 352.00,
    'Quarterly maintenance retainer',
    'seed-script', 'seed-script',
    CURRENT_TIMESTAMP - INTERVAL '2 days', 'seed-script'
) ON CONFLICT (id) DO NOTHING;

-- 6) Jane Smith - DRAFT
INSERT INTO invoices (
    id, invoice_number, customer_id, invoice_date, due_date, status,
    subtotal, tax_amount, total_amount, paid_amount, balance, notes,
    created_by, last_modified_by
) VALUES (
    '88888888-8888-8888-8888-888888888881',
    NULL,
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '27 days',
    'DRAFT',
    150.00, 15.00, 165.00, 0.00, 165.00,
    'Email campaign setup (draft)',
    'seed-script', 'seed-script'
) ON CONFLICT (id) DO NOTHING;

COMMIT;


