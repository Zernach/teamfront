package com.invoiceme.features.payments.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository {
    Payment save(Payment payment);
    Optional<Payment> findById(UUID id);
    List<Payment> findByInvoiceId(UUID invoiceId);
    List<Payment> findByInvoiceIdAndStatus(UUID invoiceId, PaymentStatus status);
    boolean existsByInvoiceIdAndStatus(UUID invoiceId, PaymentStatus status);
}

