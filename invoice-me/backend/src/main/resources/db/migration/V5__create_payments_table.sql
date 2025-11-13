-- Payments table for invoice payments
CREATE TABLE IF NOT EXISTS payments (
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
    last_modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(100) NOT NULL,

    -- Void information
    voided_at DATE,
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

