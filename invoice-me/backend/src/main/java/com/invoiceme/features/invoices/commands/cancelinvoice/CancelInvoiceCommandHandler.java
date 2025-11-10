package com.invoiceme.features.invoices.commands.cancelinvoice;

import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceRepository;
import com.invoiceme.features.invoices.domain.InvoiceStatus;
import com.invoiceme.features.payments.domain.PaymentRepository;
import com.invoiceme.features.payments.domain.PaymentStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
public class CancelInvoiceCommandHandler {
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public CancelInvoiceCommandHandler(InvoiceRepository invoiceRepository,
                                      PaymentRepository paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public Invoice handle(CancelInvoiceCommand command) {
        // Load invoice
        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + command.getInvoiceId()));

        // Validate invoice is not PAID
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new CannotCancelPaidInvoiceException("Cannot cancel PAID invoices");
        }

        // Validate invoice has no applied payments
        if (paymentRepository.existsByInvoiceIdAndStatus(command.getInvoiceId(), PaymentStatus.APPLIED)) {
            throw new CannotCancelInvoiceWithPaymentsException("Cannot cancel invoice with recorded payments. Void payments first.");
        }

        // Validate cancellation reason
        if (command.getCancellationReason() == null || command.getCancellationReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Cancellation reason is required");
        }

        // Cancel invoice
        invoice.cancel(command.getCancellationReason(), command.getCancelledBy());

        // Save invoice
        return invoiceRepository.save(invoice);
    }

    public static class InvoiceNotFoundException extends RuntimeException {
        public InvoiceNotFoundException(String message) {
            super(message);
        }
    }

    public static class CannotCancelPaidInvoiceException extends RuntimeException {
        public CannotCancelPaidInvoiceException(String message) {
            super(message);
        }
    }

    public static class CannotCancelInvoiceWithPaymentsException extends RuntimeException {
        public CannotCancelInvoiceWithPaymentsException(String message) {
            super(message);
        }
    }
}

