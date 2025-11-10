package com.invoiceme.features.invoices.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository {
    Invoice save(Invoice invoice);
    Optional<Invoice> findById(UUID id);
    List<Invoice> findAll();
    List<Invoice> findByCustomerId(UUID customerId);
    List<Invoice> findByStatus(InvoiceStatus status);
    List<Invoice> findByDateRange(LocalDate fromDate, LocalDate toDate);
    List<Invoice> findOverdue();
}



