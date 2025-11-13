package com.invoiceme.features.payments.queries.getpaymentbyid;

import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.domain.PaymentRepository;
import com.invoiceme.features.payments.dto.PaymentDetailDto;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class GetPaymentByIdQueryHandler {
    private final PaymentRepository paymentRepository;

    public GetPaymentByIdQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public PaymentDetailDto handle(GetPaymentByIdQuery query) {
        Payment payment = paymentRepository.findById(query.getPaymentId())
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found: " + query.getPaymentId()));

        return toPaymentDetailDto(payment);
    }

    private PaymentDetailDto toPaymentDetailDto(Payment payment) {
        PaymentDetailDto dto = new PaymentDetailDto();
        dto.setId(payment.getId());
        dto.setInvoiceId(payment.getInvoiceId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setReferenceNumber(payment.getReferenceNumber());
        dto.setStatus(payment.getStatus());
        dto.setNotes(payment.getNotes());
        dto.setCreatedAt(payment.getAuditInfo().getCreatedAt().toString());
        dto.setCreatedBy(payment.getAuditInfo().getCreatedBy());
        dto.setVoidedAt(payment.getVoidedAt());
        dto.setVoidedBy(payment.getVoidedBy());
        dto.setVoidReason(payment.getVoidReason());
        return dto;
    }

    public static class PaymentNotFoundException extends RuntimeException {
        public PaymentNotFoundException(String message) {
            super(message);
        }
    }
}

