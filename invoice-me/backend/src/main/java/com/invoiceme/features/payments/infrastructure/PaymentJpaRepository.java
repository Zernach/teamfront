package com.invoiceme.features.payments.infrastructure;

import com.invoiceme.features.payments.domain.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentJpaRepository extends JpaRepository<PaymentEntity, UUID> {
    List<PaymentEntity> findByInvoiceId(UUID invoiceId);
    List<PaymentEntity> findByInvoiceIdAndStatus(UUID invoiceId, PaymentStatus status);
    boolean existsByInvoiceIdAndStatus(UUID invoiceId, PaymentStatus status);
}

