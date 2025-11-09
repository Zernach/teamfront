package com.invoiceme.features.invoices.commands.markinvoiceassent;

import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceRepository;
import com.invoiceme.features.invoices.domain.InvoiceStatus;
import com.invoiceme.features.invoices.services.InvoiceNumberGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class MarkInvoiceAsSentCommandHandler {
    private final InvoiceRepository invoiceRepository;
    private final InvoiceNumberGenerator invoiceNumberGenerator;

    public MarkInvoiceAsSentCommandHandler(InvoiceRepository invoiceRepository,
                                          InvoiceNumberGenerator invoiceNumberGenerator) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceNumberGenerator = invoiceNumberGenerator;
    }

    @Transactional
    public Invoice handle(MarkInvoiceAsSentCommand command) {
        // Load existing invoice
        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found with id: " + command.getInvoiceId()));

        // Validate invoice is in DRAFT status
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvoiceNotDraftException("Invoice is not in DRAFT status. Current status: " + invoice.getStatus());
        }

        // Validate invoice has at least one line item
        if (invoice.getLineItems() == null || invoice.getLineItems().isEmpty()) {
            throw new IllegalStateException("Invoice must have at least one line item before being sent");
        }

        // Generate invoice number
        String invoiceNumber = invoiceNumberGenerator.generateInvoiceNumber();

        // Use provided sent date or default to current date
        LocalDate sentDate = command.getSentDate() != null
                ? command.getSentDate()
                : LocalDate.now();

        // Mark invoice as sent
        invoice.markAsSent(invoiceNumber, sentDate, command.getSentBy());

        // Save updated invoice
        return invoiceRepository.save(invoice);
    }

    public static class InvoiceNotFoundException extends RuntimeException {
        public InvoiceNotFoundException(String message) {
            super(message);
        }
    }

    public static class InvoiceNotDraftException extends RuntimeException {
        public InvoiceNotDraftException(String message) {
            super(message);
        }
    }
}


