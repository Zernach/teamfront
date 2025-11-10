package com.invoiceme.features.invoices.queries.getinvoicebyid;

import java.util.UUID;

public class GetInvoiceByIdQuery {
    private final UUID invoiceId;

    public GetInvoiceByIdQuery(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }
}

