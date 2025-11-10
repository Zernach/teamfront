package com.invoiceme.features.payments.infrastructure;

import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.domain.PaymentRepository;
import com.invoiceme.features.payments.domain.PaymentStatus;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class PaymentRepositoryImpl implements PaymentRepository {
    private final PaymentJpaRepository jpaRepository;

    public PaymentRepositoryImpl(PaymentJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Payment save(Payment payment) {
        PaymentEntity entity = jpaRepository.findById(payment.getId())
                .map(existing -> {
                    // Update existing entity
                    existing.setInvoiceId(payment.getInvoiceId());
                    existing.setAmount(payment.getAmount());
                    existing.setPaymentDate(payment.getPaymentDate());
                    existing.setPaymentMethod(payment.getPaymentMethod());
                    existing.setReferenceNumber(payment.getReferenceNumber());
                    existing.setStatus(payment.getStatus());
                    existing.setNotes(payment.getNotes());
                    existing.setLastModifiedAt(payment.getAuditInfo().getLastModifiedAt());
                    existing.setLastModifiedBy(payment.getAuditInfo().getLastModifiedBy());
                    existing.setVoidedAt(payment.getVoidedAt());
                    existing.setVoidedBy(payment.getVoidedBy());
                    existing.setVoidReason(payment.getVoidReason());
                    return existing;
                })
                .orElseGet(() -> new PaymentEntity(payment));

        PaymentEntity saved = jpaRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Payment> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(PaymentEntity::toDomain);
    }

    @Override
    public List<Payment> findByInvoiceId(UUID invoiceId) {
        return jpaRepository.findByInvoiceId(invoiceId).stream()
                .map(PaymentEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Payment> findByInvoiceIdAndStatus(UUID invoiceId, PaymentStatus status) {
        return jpaRepository.findByInvoiceIdAndStatus(invoiceId, status).stream()
                .map(PaymentEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByInvoiceIdAndStatus(UUID invoiceId, PaymentStatus status) {
        return jpaRepository.existsByInvoiceIdAndStatus(invoiceId, status);
    }
}

