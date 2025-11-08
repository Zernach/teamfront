package com.invoiceme.features.invoices.infrastructure;

import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceStatus;
import com.invoiceme.features.invoices.domain.LineItem;
import com.invoiceme.features.customers.domain.valueobjects.AuditInfo;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "invoices")
public class InvoiceEntity {
    @Id
    private UUID id;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private InvoiceStatus status;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LineItemEntity> lineItems = new ArrayList<>();

    @Column(name = "subtotal", nullable = false, precision = 19, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "tax_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "balance", nullable = false, precision = 19, scale = 2)
    private BigDecimal balance;

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

    // Default constructor for JPA
    public InvoiceEntity() {
    }

    // Constructor from domain object
    public InvoiceEntity(Invoice invoice) {
        this.id = invoice.getId();
        this.customerId = invoice.getCustomerId();
        this.invoiceNumber = invoice.getInvoiceNumber();
        this.invoiceDate = invoice.getInvoiceDate();
        this.dueDate = invoice.getDueDate();
        this.status = invoice.getStatus();
        this.subtotal = invoice.getSubtotal();
        this.taxAmount = invoice.getTaxAmount();
        this.totalAmount = invoice.getTotalAmount();
        this.paidAmount = invoice.getPaidAmount();
        this.balance = invoice.getBalance();
        this.notes = invoice.getNotes();
        this.createdAt = invoice.getAuditInfo().getCreatedAt();
        this.lastModifiedAt = invoice.getAuditInfo().getLastModifiedAt();
        this.createdBy = invoice.getAuditInfo().getCreatedBy();
        this.lastModifiedBy = invoice.getAuditInfo().getLastModifiedBy();

        // Map line items
        this.lineItems = invoice.getLineItems().stream()
                .map(item -> new LineItemEntity(this, item))
                .collect(Collectors.toList());
    }

    public Invoice toDomain() {
        List<LineItem> domainLineItems = lineItems.stream()
                .map(LineItemEntity::toDomain)
                .collect(Collectors.toList());

        return Invoice.reconstruct(
                id,
                customerId,
                invoiceNumber,
                invoiceDate,
                dueDate,
                status,
                domainLineItems,
                subtotal,
                taxAmount,
                totalAmount,
                paidAmount,
                balance,
                notes,
                AuditInfo.reconstruct(createdAt, lastModifiedAt, createdBy, lastModifiedBy)
        );
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public void setStatus(InvoiceStatus status) {
        this.status = status;
    }

    public List<LineItemEntity> getLineItems() {
        return lineItems;
    }

    public void setLineItems(List<LineItemEntity> lineItems) {
        this.lineItems = lineItems;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
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
}

