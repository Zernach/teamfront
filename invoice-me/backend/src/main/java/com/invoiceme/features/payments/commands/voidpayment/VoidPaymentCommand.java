package com.invoiceme.features.payments.commands.voidpayment;

import java.util.UUID;

public class VoidPaymentCommand {
    private final UUID paymentId;
    private final String voidReason;
    private final String voidedBy;

    public VoidPaymentCommand(UUID paymentId, String voidReason, String voidedBy) {
        this.paymentId = paymentId;
        this.voidReason = voidReason;
        this.voidedBy = voidedBy;
    }

    public UUID getPaymentId() {
        return paymentId;
    }

    public String getVoidReason() {
        return voidReason;
    }

    public String getVoidedBy() {
        return voidedBy;
    }
}

