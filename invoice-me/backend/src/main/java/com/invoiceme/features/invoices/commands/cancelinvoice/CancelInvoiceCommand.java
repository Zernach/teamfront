package com.invoiceme.features.invoices.commands.cancelinvoice;

import java.util.UUID;

public class CancelInvoiceCommand {
    private final UUID invoiceId;
    private final String cancellationReason;
    private final String cancelledBy;

    public CancelInvoiceCommand(UUID invoiceId, String cancellationReason, String cancelledBy) {
        this.invoiceId = invoiceId;
        this.cancellationReason = cancellationReason;
        this.cancelledBy = cancelledBy;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public String getCancelledBy() {
        return cancelledBy;
    }
}

