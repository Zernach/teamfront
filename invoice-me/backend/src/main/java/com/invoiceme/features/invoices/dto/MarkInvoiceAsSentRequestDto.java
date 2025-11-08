package com.invoiceme.features.invoices.dto;

import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;

public class MarkInvoiceAsSentRequestDto {
    @PastOrPresent(message = "Sent date cannot be in the future")
    private LocalDate sentDate;

    public LocalDate getSentDate() {
        return sentDate;
    }

    public void setSentDate(LocalDate sentDate) {
        this.sentDate = sentDate;
    }
}

