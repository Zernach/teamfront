package com.invoiceme.features.invoices.commands.markinvoiceassent;

import java.time.LocalDate;
import java.util.UUID;

public class MarkInvoiceAsSentCommand {
    private UUID invoiceId;
    private LocalDate sentDate;
    private String sentBy;

    public MarkInvoiceAsSentCommand() {
    }

    public MarkInvoiceAsSentCommand(UUID invoiceId, LocalDate sentDate, String sentBy) {
        this.invoiceId = invoiceId;
        this.sentDate = sentDate;
        this.sentBy = sentBy;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }

    public LocalDate getSentDate() {
        return sentDate;
    }

    public void setSentDate(LocalDate sentDate) {
        this.sentDate = sentDate;
    }

    public String getSentBy() {
        return sentBy;
    }

    public void setSentBy(String sentBy) {
        this.sentBy = sentBy;
    }
}



