package com.invoiceme.features.invoices.commands.recordpaymentforinvoice;

import com.invoiceme.features.payments.domain.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class RecordPaymentForInvoiceCommand {
    private final UUID invoiceId;
    private final BigDecimal amount;
    private final LocalDate paymentDate;
    private final PaymentMethod paymentMethod;
    private final String referenceNumber;
    private final String notes;
    private final String createdBy;

    public RecordPaymentForInvoiceCommand(UUID invoiceId, BigDecimal amount, LocalDate paymentDate,
                                         PaymentMethod paymentMethod, String referenceNumber, String notes, String createdBy) {
        this.invoiceId = invoiceId;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.referenceNumber = referenceNumber;
        this.notes = notes;
        this.createdBy = createdBy;
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

    public String getNotes() {
        return notes;
    }

    public String getCreatedBy() {
        return createdBy;
    }
}

