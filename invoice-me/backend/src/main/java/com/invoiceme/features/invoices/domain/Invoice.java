package com.invoiceme.features.invoices.domain;

import com.invoiceme.features.customers.domain.valueobjects.AuditInfo;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class Invoice {
    private UUID id;
    private UUID customerId;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private InvoiceStatus status;
    private List<LineItem> lineItems;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balance;
    private String notes;
    private AuditInfo auditInfo;

    // Private constructor for JPA
    private Invoice() {
    }

    // Package-private constructor for reconstruction from entity
    Invoice(UUID id, UUID customerId, String invoiceNumber, LocalDate invoiceDate, LocalDate dueDate,
            InvoiceStatus status, List<LineItem> lineItems, BigDecimal subtotal, BigDecimal taxAmount,
            BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal balance, String notes, AuditInfo auditInfo) {
        this.id = id;
        this.customerId = customerId;
        this.invoiceNumber = invoiceNumber;
        this.invoiceDate = invoiceDate;
        this.dueDate = dueDate;
        this.status = status;
        this.lineItems = new ArrayList<>(lineItems);
        this.subtotal = subtotal;
        this.taxAmount = taxAmount;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.balance = balance;
        this.notes = notes;
        this.auditInfo = auditInfo;
    }

    public static Invoice reconstruct(UUID id, UUID customerId, String invoiceNumber, LocalDate invoiceDate,
                                     LocalDate dueDate, InvoiceStatus status, List<LineItem> lineItems,
                                     BigDecimal subtotal, BigDecimal taxAmount, BigDecimal totalAmount,
                                     BigDecimal paidAmount, BigDecimal balance, String notes, AuditInfo auditInfo) {
        return new Invoice(id, customerId, invoiceNumber, invoiceDate, dueDate, status, lineItems,
                subtotal, taxAmount, totalAmount, paidAmount, balance, notes, auditInfo);
    }

    public static Invoice create(UUID customerId, LocalDate invoiceDate, LocalDate dueDate,
                                List<LineItem> lineItems, BigDecimal taxAmount, String notes, String createdBy) {
        if (lineItems == null || lineItems.isEmpty()) {
            throw new IllegalArgumentException("Invoice must have at least one line item");
        }

        // Calculate subtotal
        BigDecimal subtotal = lineItems.stream()
                .map(LineItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tax amount defaults to 0 if null
        BigDecimal tax = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        if (tax.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Tax amount cannot be negative");
        }

        // Calculate total amount
        BigDecimal total = subtotal.add(tax);

        UUID id = UUID.randomUUID();
        return new Invoice(
                id,
                customerId,
                null, // Invoice number is null until sent
                invoiceDate,
                dueDate,
                InvoiceStatus.DRAFT,
                new ArrayList<>(lineItems),
                subtotal,
                tax,
                total,
                BigDecimal.ZERO, // paidAmount starts at 0
                total, // balance equals totalAmount initially
                notes,
                AuditInfo.create(createdBy)
        );
    }

    // Getters
    public UUID getId() {
        return id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public List<LineItem> getLineItems() {
        return Collections.unmodifiableList(lineItems);
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public String getNotes() {
        return notes;
    }

    public AuditInfo getAuditInfo() {
        return auditInfo;
    }

    public void update(LocalDate invoiceDate, LocalDate dueDate, List<LineItem> lineItems,
                      BigDecimal taxAmount, String notes, String modifiedBy) {
        if (this.status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT invoices can be updated. Current status: " + this.status);
        }

        if (lineItems == null || lineItems.isEmpty()) {
            throw new IllegalArgumentException("Invoice must have at least one line item");
        }

        // Validate due date (must be >= invoice date)
        if (dueDate.isBefore(invoiceDate)) {
            throw new IllegalArgumentException("Due date must be greater than or equal to invoice date");
        }

        // Tax amount defaults to 0 if null
        BigDecimal tax = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        if (tax.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Tax amount cannot be negative");
        }

        // Update fields
        this.invoiceDate = invoiceDate;
        this.dueDate = dueDate;
        this.lineItems = new ArrayList<>(lineItems);
        this.taxAmount = tax;
        this.notes = notes;

        // Recalculate totals
        this.subtotal = lineItems.stream()
                .map(LineItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalAmount = this.subtotal.add(this.taxAmount);
        this.balance = this.totalAmount.subtract(this.paidAmount);

        // Update audit info
        this.auditInfo = AuditInfo.update(this.auditInfo, modifiedBy);
    }

    public void markAsSent(String invoiceNumber, LocalDate sentDate, String sentBy) {
        if (this.status != InvoiceStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT invoices can be marked as sent. Current status: " + this.status);
        }

        if (this.lineItems == null || this.lineItems.isEmpty()) {
            throw new IllegalStateException("Invoice must have at least one line item before being sent");
        }

        if (invoiceNumber == null || invoiceNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Invoice number is required");
        }

        this.invoiceNumber = invoiceNumber;
        this.status = InvoiceStatus.SENT;
        // Note: sentDate and sentBy are stored in audit info, but we don't have a separate field
        // For now, we'll update the lastModifiedAt and lastModifiedBy
        this.auditInfo = AuditInfo.update(this.auditInfo, sentBy);
    }

    public void applyPayment(BigDecimal paymentAmount, String modifiedBy) {
        if (this.status == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Cannot apply payment to cancelled invoice");
        }

        if (this.status != InvoiceStatus.SENT && this.status != InvoiceStatus.PAID) {
            throw new IllegalStateException("Can only apply payment to SENT or PAID invoices. Current status: " + this.status);
        }

        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        if (paymentAmount.compareTo(this.balance) > 0) {
            throw new IllegalArgumentException("Payment amount cannot exceed invoice balance");
        }

        // Apply payment
        this.paidAmount = this.paidAmount.add(paymentAmount);
        this.balance = this.totalAmount.subtract(this.paidAmount);

        // Update status to PAID if balance reaches zero
        if (this.balance.compareTo(BigDecimal.ZERO) == 0) {
            this.status = InvoiceStatus.PAID;
        }

        // Update audit info
        this.auditInfo = AuditInfo.update(this.auditInfo, modifiedBy);
    }

    public void reversePayment(BigDecimal paymentAmount, String modifiedBy) {
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        // Reverse payment
        this.paidAmount = this.paidAmount.subtract(paymentAmount);
        if (this.paidAmount.compareTo(BigDecimal.ZERO) < 0) {
            this.paidAmount = BigDecimal.ZERO;
        }

        this.balance = this.totalAmount.subtract(this.paidAmount);

        // If invoice was PAID and now has balance, change status back to SENT
        if (this.status == InvoiceStatus.PAID && this.balance.compareTo(BigDecimal.ZERO) > 0) {
            this.status = InvoiceStatus.SENT;
        }

        // Update audit info
        this.auditInfo = AuditInfo.update(this.auditInfo, modifiedBy);
    }

    public void cancel(String cancellationReason, String cancelledBy) {
        if (this.status == InvoiceStatus.PAID) {
            throw new IllegalStateException("Cannot cancel PAID invoices");
        }

        if (this.status == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Invoice is already cancelled");
        }

        if (cancellationReason == null || cancellationReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Cancellation reason is required");
        }

        this.status = InvoiceStatus.CANCELLED;
        this.auditInfo = AuditInfo.update(this.auditInfo, cancelledBy);
    }
}

