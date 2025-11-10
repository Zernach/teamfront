package com.invoiceme.features.invoices.commands.recordpaymentforinvoice;

import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceRepository;
import com.invoiceme.features.invoices.domain.InvoiceStatus;
import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.domain.PaymentMethod;
import com.invoiceme.features.payments.domain.PaymentRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Component
public class RecordPaymentForInvoiceCommandHandler {
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public RecordPaymentForInvoiceCommandHandler(InvoiceRepository invoiceRepository,
                                                PaymentRepository paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Payment handle(RecordPaymentForInvoiceCommand command) {
        // Load invoice
        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + command.getInvoiceId()));

        // Validate invoice is in SENT status
        if (invoice.getStatus() != InvoiceStatus.SENT && invoice.getStatus() != InvoiceStatus.PAID) {
            throw new InvoiceNotSentException("Invoice must be in SENT status to record payment. Current status: " + invoice.getStatus());
        }

        // Validate payment amount
        if (command.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        // Validate payment amount doesn't exceed balance
        if (command.getAmount().compareTo(invoice.getBalance()) > 0) {
            throw new PaymentExceedsBalanceException("Payment amount exceeds invoice balance");
        }

        // Validate payment date
        if (command.getPaymentDate().isBefore(invoice.getInvoiceDate())) {
            throw new IllegalArgumentException("Payment date cannot be before invoice date");
        }

        // Create payment
        Payment payment = Payment.create(
                command.getInvoiceId(),
                command.getAmount(),
                command.getPaymentDate(),
                command.getPaymentMethod(),
                command.getReferenceNumber(),
                command.getNotes(),
                command.getCreatedBy()
        );

        // Apply payment to invoice
        invoice.applyPayment(command.getAmount(), command.getCreatedBy());

        // Save payment and invoice
        Payment savedPayment = paymentRepository.save(payment);
        invoiceRepository.save(invoice);

        return savedPayment;
    }

    public static class InvoiceNotFoundException extends RuntimeException {
        public InvoiceNotFoundException(String message) {
            super(message);
        }
    }

    public static class InvoiceNotSentException extends RuntimeException {
        public InvoiceNotSentException(String message) {
            super(message);
        }
    }

    public static class PaymentExceedsBalanceException extends RuntimeException {
        public PaymentExceedsBalanceException(String message) {
            super(message);
        }
    }
}

