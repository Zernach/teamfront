package com.invoiceme.features.payments.infrastructure;

import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.domain.PaymentMethod;
import com.invoiceme.features.payments.domain.PaymentStatus;
import com.invoiceme.features.customers.domain.valueobjects.AuditInfo;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class PaymentEntity {
    @Id
    private UUID id;

    @Column(name = "invoice_id", nullable = false)
    private UUID invoiceId;

    @Column(name = "amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "last_modified_at", nullable = false)
    private java.time.LocalDateTime lastModifiedAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "last_modified_by", nullable = false)
    private String lastModifiedBy;

    @Column(name = "voided_at")
    private LocalDate voidedAt;

    @Column(name = "voided_by", length = 100)
    private String voidedBy;

    @Column(name = "void_reason", length = 2000)
    private String voidReason;

    // Default constructor for JPA
    public PaymentEntity() {
    }

    // Constructor from domain object
    public PaymentEntity(Payment payment) {
        this.id = payment.getId();
        this.invoiceId = payment.getInvoiceId();
        this.amount = payment.getAmount();
        this.paymentDate = payment.getPaymentDate();
        this.paymentMethod = payment.getPaymentMethod();
        this.referenceNumber = payment.getReferenceNumber();
        this.status = payment.getStatus();
        this.notes = payment.getNotes();
        this.createdAt = payment.getAuditInfo().getCreatedAt();
        this.lastModifiedAt = payment.getAuditInfo().getLastModifiedAt();
        this.createdBy = payment.getAuditInfo().getCreatedBy();
        this.lastModifiedBy = payment.getAuditInfo().getLastModifiedBy();
        this.voidedAt = payment.getVoidedAt();
        this.voidedBy = payment.getVoidedBy();
        this.voidReason = payment.getVoidReason();
    }

    public Payment toDomain() {
        return Payment.reconstruct(
                id,
                invoiceId,
                amount,
                paymentDate,
                paymentMethod,
                referenceNumber,
                status,
                notes,
                AuditInfo.reconstruct(createdAt, lastModifiedAt, createdBy, lastModifiedBy),
                voidedAt,
                voidedBy,
                voidReason
        );
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.time.LocalDateTime getLastModifiedAt() {
        return lastModifiedAt;
    }

    public void setLastModifiedAt(java.time.LocalDateTime lastModifiedAt) {
        this.lastModifiedAt = lastModifiedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public LocalDate getVoidedAt() {
        return voidedAt;
    }

    public void setVoidedAt(LocalDate voidedAt) {
        this.voidedAt = voidedAt;
    }

    public String getVoidedBy() {
        return voidedBy;
    }

    public void setVoidedBy(String voidedBy) {
        this.voidedBy = voidedBy;
    }

    public String getVoidReason() {
        return voidReason;
    }

    public void setVoidReason(String voidReason) {
        this.voidReason = voidReason;
    }
}

