package com.invoiceme.features.payments.queries.listpaymentsforinvoice;

import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.domain.PaymentRepository;
import com.invoiceme.features.payments.dto.PaymentDetailDto;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ListPaymentsForInvoiceQueryHandler {
    private final PaymentRepository paymentRepository;

    public ListPaymentsForInvoiceQueryHandler(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public List<PaymentDetailDto> handle(ListPaymentsForInvoiceQuery query) {
        List<Payment> payments;
        
        if (query.getStatus() != null) {
            payments = paymentRepository.findByInvoiceIdAndStatus(query.getInvoiceId(), query.getStatus());
        } else {
            payments = paymentRepository.findByInvoiceId(query.getInvoiceId());
        }

        return payments.stream()
                .map(this::toPaymentDetailDto)
                .collect(Collectors.toList());
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
}

