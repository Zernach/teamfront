package com.invoiceme.features.payments.api;

import com.invoiceme.features.payments.commands.voidpayment.VoidPaymentCommand;
import com.invoiceme.features.payments.commands.voidpayment.VoidPaymentCommandHandler;
import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.domain.PaymentStatus;
import com.invoiceme.features.payments.dto.PaymentDetailDto;
import com.invoiceme.features.payments.dto.VoidPaymentRequestDto;
import com.invoiceme.features.payments.queries.getpaymentbyid.GetPaymentByIdQuery;
import com.invoiceme.features.payments.queries.getpaymentbyid.GetPaymentByIdQueryHandler;
import com.invoiceme.features.payments.queries.listpaymentsforinvoice.ListPaymentsForInvoiceQuery;
import com.invoiceme.features.payments.queries.listpaymentsforinvoice.ListPaymentsForInvoiceQueryHandler;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    private final VoidPaymentCommandHandler voidPaymentCommandHandler;
    private final GetPaymentByIdQueryHandler getPaymentByIdQueryHandler;
    private final ListPaymentsForInvoiceQueryHandler listPaymentsForInvoiceQueryHandler;

    public PaymentController(VoidPaymentCommandHandler voidPaymentCommandHandler,
                           GetPaymentByIdQueryHandler getPaymentByIdQueryHandler,
                           ListPaymentsForInvoiceQueryHandler listPaymentsForInvoiceQueryHandler) {
        this.voidPaymentCommandHandler = voidPaymentCommandHandler;
        this.getPaymentByIdQueryHandler = getPaymentByIdQueryHandler;
        this.listPaymentsForInvoiceQueryHandler = listPaymentsForInvoiceQueryHandler;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDetailDto> getPaymentById(@PathVariable UUID id) {
        try {
            GetPaymentByIdQuery query = new GetPaymentByIdQuery(id);
            PaymentDetailDto payment = getPaymentByIdQueryHandler.handle(query);
            return ResponseEntity.ok(payment);
        } catch (GetPaymentByIdQueryHandler.PaymentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<PaymentDetailDto>> listPaymentsForInvoice(
            @RequestParam UUID invoiceId,
            @RequestParam(required = false) PaymentStatus status) {
        ListPaymentsForInvoiceQuery query = new ListPaymentsForInvoiceQuery(invoiceId, status);
        List<PaymentDetailDto> payments = listPaymentsForInvoiceQueryHandler.handle(query);
        return ResponseEntity.ok(payments);
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

