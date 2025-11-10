package com.invoiceme.features.invoices.dto;

import jakarta.validation.constraints.NotBlank;

public class CancelInvoiceRequestDto {
    @NotBlank(message = "Cancellation reason is required")
    private String cancellationReason;

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
}

