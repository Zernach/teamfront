package com.invoiceme.features.invoices.infrastructure;

import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceRepository;
import com.invoiceme.features.invoices.domain.InvoiceStatus;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class InvoiceRepositoryImpl implements InvoiceRepository {
    private final InvoiceJpaRepository jpaRepository;

    public InvoiceRepositoryImpl(InvoiceJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Invoice save(Invoice invoice) {
        InvoiceEntity entity = jpaRepository.findById(invoice.getId())
                .map(existing -> {
                    // Update existing entity
                    existing.setCustomerId(invoice.getCustomerId());
                    existing.setInvoiceNumber(invoice.getInvoiceNumber());
                    existing.setInvoiceDate(invoice.getInvoiceDate());
                    existing.setDueDate(invoice.getDueDate());
                    existing.setStatus(invoice.getStatus());
                    existing.setSubtotal(invoice.getSubtotal());
                    existing.setTaxAmount(invoice.getTaxAmount());
                    existing.setTotalAmount(invoice.getTotalAmount());
                    existing.setPaidAmount(invoice.getPaidAmount());
                    existing.setBalance(invoice.getBalance());
                    existing.setNotes(invoice.getNotes());
                    existing.setLastModifiedAt(invoice.getAuditInfo().getLastModifiedAt());
                    existing.setLastModifiedBy(invoice.getAuditInfo().getLastModifiedBy());

                    // Update line items
                    existing.getLineItems().clear();
                    existing.getLineItems().addAll(
                            invoice.getLineItems().stream()
                                    .map(item -> new LineItemEntity(existing, item))
                                    .collect(Collectors.toList())
                    );

                    return existing;
                })
                .orElse(new InvoiceEntity(invoice));

        InvoiceEntity saved = jpaRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Invoice> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(InvoiceEntity::toDomain);
    }

    @Override
    public List<Invoice> findAll() {
        return jpaRepository.findAll().stream()
                .map(InvoiceEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Invoice> findByCustomerId(UUID customerId) {
        return jpaRepository.findAll().stream()
                .filter(entity -> entity.getCustomerId().equals(customerId))
                .map(InvoiceEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Invoice> findByStatus(InvoiceStatus status) {
        return jpaRepository.findAll().stream()
                .filter(entity -> entity.getStatus() == status)
                .map(InvoiceEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Invoice> findByDateRange(LocalDate fromDate, LocalDate toDate) {
        return jpaRepository.findAll().stream()
                .filter(entity -> {
                    LocalDate invoiceDate = entity.getInvoiceDate();
                    return (fromDate == null || !invoiceDate.isBefore(fromDate)) &&
                           (toDate == null || !invoiceDate.isAfter(toDate));
                })
                .map(InvoiceEntity::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Invoice> findOverdue() {
        LocalDate today = LocalDate.now();
        return jpaRepository.findAll().stream()
                .filter(entity -> entity.getDueDate().isBefore(today) &&
                                 entity.getBalance().compareTo(java.math.BigDecimal.ZERO) > 0 &&
                                 entity.getStatus() == InvoiceStatus.SENT)
                .map(InvoiceEntity::toDomain)
                .collect(Collectors.toList());
    }
}

