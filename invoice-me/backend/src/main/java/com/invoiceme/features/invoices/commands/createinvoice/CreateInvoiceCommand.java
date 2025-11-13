package com.invoiceme.features.invoices.commands.createinvoice;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CreateInvoiceCommand {
    private UUID customerId;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private List<LineItemDto> lineItems;
    private BigDecimal taxAmount;
    private String notes;
    private String createdBy;

    public CreateInvoiceCommand() {
    }

    public CreateInvoiceCommand(UUID customerId, LocalDate invoiceDate, LocalDate dueDate,
                               List<LineItemDto> lineItems, BigDecimal taxAmount, String notes, String createdBy) {
        this.customerId = customerId;
        this.invoiceDate = invoiceDate;
        this.dueDate = dueDate;
        this.lineItems = lineItems;
        this.taxAmount = taxAmount;
        this.notes = notes;
        this.createdBy = createdBy;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
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

    public List<LineItemDto> getLineItems() {
        return lineItems;
    }

    public void setLineItems(List<LineItemDto> lineItems) {
        this.lineItems = lineItems;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public static class LineItemDto {
        private String description;
        private BigDecimal quantity;
        private BigDecimal unitPrice;

        public LineItemDto() {
        }

        public LineItemDto(String description, BigDecimal quantity, BigDecimal unitPrice) {
            this.description = description;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public BigDecimal getQuantity() {
            return quantity;
        }

        public void setQuantity(BigDecimal quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }
    }
}







