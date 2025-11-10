package com.invoiceme.features.payments.dto;

import jakarta.validation.constraints.NotBlank;

public class VoidPaymentRequestDto {
    @NotBlank(message = "Void reason is required")
    private String voidReason;

    public String getVoidReason() {
        return voidReason;
    }

    public void setVoidReason(String voidReason) {
        this.voidReason = voidReason;
    }
}

