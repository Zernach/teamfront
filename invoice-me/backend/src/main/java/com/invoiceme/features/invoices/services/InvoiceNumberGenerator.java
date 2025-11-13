package com.invoiceme.features.invoices.services;

import com.invoiceme.features.invoices.infrastructure.InvoiceJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceNumberGenerator {
    private static final String PREFIX = "INV";
    private static final DateTimeFormatter YEAR_FORMATTER = DateTimeFormatter.ofPattern("yyyy");
    
    private final InvoiceJpaRepository invoiceJpaRepository;

    public InvoiceNumberGenerator(InvoiceJpaRepository invoiceJpaRepository) {
        this.invoiceJpaRepository = invoiceJpaRepository;
    }

    @Transactional
    public String generateInvoiceNumber() {
        String currentYear = LocalDate.now().format(YEAR_FORMATTER);
        String prefix = PREFIX + "-" + currentYear + "-";
        
        // Find the highest sequence number for the current year
        int maxSequence = invoiceJpaRepository.findAll().stream()
                .filter(invoice -> invoice.getInvoiceNumber() != null 
                        && invoice.getInvoiceNumber().startsWith(prefix))
                .mapToInt(invoice -> {
                    String number = invoice.getInvoiceNumber();
                    String sequenceStr = number.substring(prefix.length());
                    try {
                        return Integer.parseInt(sequenceStr);
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                })
                .max()
                .orElse(0);
        
        // Generate next sequence number
        int nextSequence = maxSequence + 1;
        
        // Format with leading zeros (4 digits)
        return prefix + String.format("%04d", nextSequence);
    }
}








