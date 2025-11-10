package com.invoiceme.features.payments.commands.voidpayment;

import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceRepository;
import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.domain.PaymentRepository;
import com.invoiceme.features.payments.domain.PaymentStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
public class VoidPaymentCommandHandler {
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public VoidPaymentCommandHandler(PaymentRepository paymentRepository,
                                    InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional
    public Payment handle(VoidPaymentCommand command) {
        // Load payment
        Payment payment = paymentRepository.findById(command.getPaymentId())
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found: " + command.getPaymentId()));

        // Validate payment has APPLIED status
        if (payment.getStatus() != PaymentStatus.APPLIED) {
            throw new PaymentAlreadyVoidedException("Payment is already voided");
        }

        // Validate void reason
        if (command.getVoidReason() == null || command.getVoidReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Void reason is required");
        }

        // Load associated invoice
        Invoice invoice = invoiceRepository.findById(payment.getInvoiceId())
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + payment.getInvoiceId()));

        // Void payment
        payment.voidPayment(command.getVoidReason(), command.getVoidedBy());

        // Reverse payment on invoice
        invoice.reversePayment(payment.getAmount(), command.getVoidedBy());

        // Save payment and invoice
        Payment savedPayment = paymentRepository.save(payment);
        invoiceRepository.save(invoice);

        return savedPayment;
    }

    public static class PaymentNotFoundException extends RuntimeException {
        public PaymentNotFoundException(String message) {
            super(message);
        }
    }

    public static class PaymentAlreadyVoidedException extends RuntimeException {
        public PaymentAlreadyVoidedException(String message) {
            super(message);
        }
    }

    public static class InvoiceNotFoundException extends RuntimeException {
        public InvoiceNotFoundException(String message) {
            super(message);
        }
    }
}

