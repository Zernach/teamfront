package com.invoiceme.features.payments.domain;

import com.invoiceme.features.customers.domain.valueobjects.AuditInfo;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class Payment {
    private UUID id;
    private UUID invoiceId;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private PaymentStatus status;
    private String notes;
    private AuditInfo auditInfo;
    private LocalDate voidedAt;
    private String voidedBy;
    private String voidReason;

    // Private constructor for JPA
    private Payment() {
    }

    // Package-private constructor for reconstruction from entity
    Payment(UUID id, UUID invoiceId, BigDecimal amount, LocalDate paymentDate,
            PaymentMethod paymentMethod, String referenceNumber, PaymentStatus status,
            String notes, AuditInfo auditInfo, LocalDate voidedAt, String voidedBy, String voidReason) {
        this.id = id;
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.referenceNumber = referenceNumber;
        this.status = status;
        this.notes = notes;
        this.auditInfo = auditInfo;
        this.voidedAt = voidedAt;
        this.voidedBy = voidedBy;
        this.voidReason = voidReason;
    }

    public static Payment reconstruct(UUID id, UUID invoiceId, BigDecimal amount, LocalDate paymentDate,
                                    PaymentMethod paymentMethod, String referenceNumber, PaymentStatus status,
                                    String notes, AuditInfo auditInfo, LocalDate voidedAt, String voidedBy, String voidReason) {
        return new Payment(id, invoiceId, amount, paymentDate, paymentMethod, referenceNumber,
                status, notes, auditInfo, voidedAt, voidedBy, voidReason);
    }

    public static Payment create(UUID invoiceId, BigDecimal amount, LocalDate paymentDate,
                                PaymentMethod paymentMethod, String referenceNumber, String notes, String createdBy) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        if (paymentDate == null) {
            throw new IllegalArgumentException("Payment date is required");
        }

        if (paymentMethod == null) {
            throw new IllegalArgumentException("Payment method is required");
        }

        UUID id = UUID.randomUUID();
        return new Payment(
                id,
                invoiceId,
                amount,
                paymentDate,
                paymentMethod,
                referenceNumber,
                PaymentStatus.APPLIED,
                notes,
                AuditInfo.create(createdBy),
                null,
                null,
                null
        );
    }

    public void voidPayment(String voidReason, String voidedBy) {
        if (this.status == PaymentStatus.VOIDED) {
            throw new IllegalStateException("Payment is already voided");
        }

        if (voidReason == null || voidReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Void reason is required");
        }

        this.status = PaymentStatus.VOIDED;
        this.voidedAt = LocalDate.now();
        this.voidedBy = voidedBy;
        this.voidReason = voidReason;
        this.auditInfo = AuditInfo.update(this.auditInfo, voidedBy);
    }

    // Getters
    public UUID getId() {
        return id;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public String getNotes() {
        return notes;
    }

    public AuditInfo getAuditInfo() {
        return auditInfo;
    }

    public LocalDate getVoidedAt() {
        return voidedAt;
    }

    public String getVoidedBy() {
        return voidedBy;
    }

    public String getVoidReason() {
        return voidReason;
    }
}

