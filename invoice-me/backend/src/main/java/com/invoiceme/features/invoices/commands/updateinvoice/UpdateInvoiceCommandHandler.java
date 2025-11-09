package com.invoiceme.features.invoices.commands.updateinvoice;

import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceRepository;
import com.invoiceme.features.invoices.domain.InvoiceStatus;
import com.invoiceme.features.invoices.domain.LineItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UpdateInvoiceCommandHandler {
    private final InvoiceRepository invoiceRepository;

    public UpdateInvoiceCommandHandler(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public Invoice handle(UpdateInvoiceCommand command) {
        // Load existing invoice
        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found with id: " + command.getInvoiceId()));

        // Validate invoice is in DRAFT status
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new InvoiceNotDraftException("Invoice is not in DRAFT status. Current status: " + invoice.getStatus());
        }

        // Prepare update values (use existing values if not provided)
        java.time.LocalDate invoiceDate = command.getInvoiceDate() != null
                ? command.getInvoiceDate()
                : invoice.getInvoiceDate();

        java.time.LocalDate dueDate = command.getDueDate() != null
                ? command.getDueDate()
                : invoice.getDueDate();

        List<LineItem> lineItems;
        if (command.getLineItems() != null && !command.getLineItems().isEmpty()) {
            // Convert DTOs to domain LineItems (validation happens in LineItem.of)
            lineItems = command.getLineItems().stream()
                    .map(dto -> LineItem.of(dto.getDescription(), dto.getQuantity(), dto.getUnitPrice()))
                    .collect(Collectors.toList());
        } else {
            // Use existing line items
            lineItems = invoice.getLineItems();
        }

        BigDecimal taxAmount = command.getTaxAmount() != null
                ? command.getTaxAmount()
                : invoice.getTaxAmount();

        String notes = command.getNotes() != null
                ? command.getNotes()
                : invoice.getNotes();

        // Update invoice (validation happens in Invoice.update)
        invoice.update(invoiceDate, dueDate, lineItems, taxAmount, notes, command.getModifiedBy());

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


