package com.invoiceme.features.payments.queries.listpaymentsforinvoice;

import com.invoiceme.features.payments.domain.PaymentStatus;

import java.util.UUID;

public class ListPaymentsForInvoiceQuery {
    private final UUID invoiceId;
    private final PaymentStatus status;

    public ListPaymentsForInvoiceQuery(UUID invoiceId, PaymentStatus status) {
        this.invoiceId = invoiceId;
        this.status = status;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public PaymentStatus getStatus() {
        return status;
    }
}

