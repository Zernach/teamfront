package com.invoiceme.features.payments.queries.getpaymentbyid;

import java.util.UUID;

public class GetPaymentByIdQuery {
    private final UUID paymentId;

    public GetPaymentByIdQuery(UUID paymentId) {
        this.paymentId = paymentId;
    }

    public UUID getPaymentId() {
        return paymentId;
    }
}

