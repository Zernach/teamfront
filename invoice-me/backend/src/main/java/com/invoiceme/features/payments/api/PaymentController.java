package com.invoiceme.features.payments.api;

import com.invoiceme.features.payments.commands.voidpayment.VoidPaymentCommand;
import com.invoiceme.features.payments.commands.voidpayment.VoidPaymentCommandHandler;
import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.dto.PaymentDetailDto;
import com.invoiceme.features.payments.dto.VoidPaymentRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    private final VoidPaymentCommandHandler voidPaymentCommandHandler;

    public PaymentController(VoidPaymentCommandHandler voidPaymentCommandHandler) {
        this.voidPaymentCommandHandler = voidPaymentCommandHandler;
    }

    @PostMapping("/{id}/void")
    public ResponseEntity<PaymentDetailDto> voidPayment(@PathVariable UUID id,
                                                        @Valid @RequestBody VoidPaymentRequestDto request) {
        try {
            VoidPaymentCommand command = new VoidPaymentCommand(
                    id,
                    request.getVoidReason(),
                    "system" // TODO: Get from authentication context
            );

            Payment payment = voidPaymentCommandHandler.handle(command);
            PaymentDetailDto response = toPaymentDetailDto(payment);

            return ResponseEntity.ok(response);
        } catch (VoidPaymentCommandHandler.PaymentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (VoidPaymentCommandHandler.PaymentAlreadyVoidedException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
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

