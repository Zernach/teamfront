package com.invoiceme.features.invoices.commands.createinvoice;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import com.invoiceme.features.customers.domain.CustomerStatus;
import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceRepository;
import com.invoiceme.features.invoices.domain.LineItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CreateInvoiceCommandHandler {
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    public CreateInvoiceCommandHandler(InvoiceRepository invoiceRepository, CustomerRepository customerRepository) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional
    public Invoice handle(CreateInvoiceCommand command) {
        // Validate customer exists and is ACTIVE
        Customer customer = customerRepository.findById(command.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + command.getCustomerId()));

        if (customer.getStatus() != CustomerStatus.ACTIVE) {
            throw new CustomerInactiveException("Customer is not active. Current status: " + customer.getStatus());
        }

        // Validate invoice date (cannot be in the future)
        LocalDate today = LocalDate.now();
        if (command.getInvoiceDate().isAfter(today)) {
            throw new InvalidInvoiceDateException("Invoice date cannot be in the future");
        }

        // Validate due date (must be >= invoice date)
        if (command.getDueDate().isBefore(command.getInvoiceDate())) {
            throw new InvalidDueDateException("Due date must be greater than or equal to invoice date");
        }

        // Validate at least one line item exists
        if (command.getLineItems() == null || command.getLineItems().isEmpty()) {
            throw new IllegalArgumentException("Invoice must have at least one line item");
        }

        // Convert DTOs to domain LineItems (validation happens in LineItem.of)
        List<LineItem> lineItems = command.getLineItems().stream()
                .map(dto -> LineItem.of(dto.getDescription(), dto.getQuantity(), dto.getUnitPrice()))
                .collect(Collectors.toList());

        // Validate tax amount
        BigDecimal taxAmount = command.getTaxAmount();
        if (taxAmount != null && taxAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Tax amount cannot be negative");
        }

        // Create invoice
        Invoice invoice = Invoice.create(
                command.getCustomerId(),
                command.getInvoiceDate(),
                command.getDueDate(),
                lineItems,
                taxAmount,
                command.getNotes(),
                command.getCreatedBy()
        );

        // Save invoice
        return invoiceRepository.save(invoice);
    }

    public static class CustomerNotFoundException extends RuntimeException {
        public CustomerNotFoundException(String message) {
            super(message);
        }
    }

    public static class CustomerInactiveException extends RuntimeException {
        public CustomerInactiveException(String message) {
            super(message);
        }
    }

    public static class InvalidInvoiceDateException extends RuntimeException {
        public InvalidInvoiceDateException(String message) {
            super(message);
        }
    }

    public static class InvalidDueDateException extends RuntimeException {
        public InvalidDueDateException(String message) {
            super(message);
        }
    }
}





