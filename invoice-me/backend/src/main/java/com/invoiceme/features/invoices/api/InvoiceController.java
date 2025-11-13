package com.invoiceme.features.invoices.api;

import com.invoiceme.features.invoices.commands.createinvoice.CreateInvoiceCommand;
import com.invoiceme.features.invoices.commands.createinvoice.CreateInvoiceCommandHandler;
import com.invoiceme.features.invoices.commands.updateinvoice.UpdateInvoiceCommand;
import com.invoiceme.features.invoices.commands.updateinvoice.UpdateInvoiceCommandHandler;
import com.invoiceme.features.invoices.commands.markinvoiceassent.MarkInvoiceAsSentCommand;
import com.invoiceme.features.invoices.commands.markinvoiceassent.MarkInvoiceAsSentCommandHandler;
import com.invoiceme.features.invoices.commands.recordpaymentforinvoice.RecordPaymentForInvoiceCommand;
import com.invoiceme.features.invoices.commands.recordpaymentforinvoice.RecordPaymentForInvoiceCommandHandler;
import com.invoiceme.features.invoices.commands.cancelinvoice.CancelInvoiceCommand;
import com.invoiceme.features.invoices.commands.cancelinvoice.CancelInvoiceCommandHandler;
import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceStatus;
import com.invoiceme.features.invoices.dto.*;
import com.invoiceme.features.invoices.queries.getinvoicebyid.GetInvoiceByIdQuery;
import com.invoiceme.features.invoices.queries.getinvoicebyid.GetInvoiceByIdQueryHandler;
import com.invoiceme.features.invoices.queries.listinvoices.ListInvoicesQuery;
import com.invoiceme.features.invoices.queries.listinvoices.ListInvoicesQueryHandler;
import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.dto.PaymentDetailDto;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {
    private final CreateInvoiceCommandHandler createInvoiceCommandHandler;
    private final UpdateInvoiceCommandHandler updateInvoiceCommandHandler;
    private final MarkInvoiceAsSentCommandHandler markInvoiceAsSentCommandHandler;
    private final RecordPaymentForInvoiceCommandHandler recordPaymentCommandHandler;
    private final CancelInvoiceCommandHandler cancelInvoiceCommandHandler;
    private final GetInvoiceByIdQueryHandler getInvoiceByIdQueryHandler;
    private final ListInvoicesQueryHandler listInvoicesQueryHandler;

    public InvoiceController(CreateInvoiceCommandHandler createInvoiceCommandHandler,
                            UpdateInvoiceCommandHandler updateInvoiceCommandHandler,
                            MarkInvoiceAsSentCommandHandler markInvoiceAsSentCommandHandler,
                            RecordPaymentForInvoiceCommandHandler recordPaymentCommandHandler,
                            CancelInvoiceCommandHandler cancelInvoiceCommandHandler,
                            GetInvoiceByIdQueryHandler getInvoiceByIdQueryHandler,
                            ListInvoicesQueryHandler listInvoicesQueryHandler) {
        this.createInvoiceCommandHandler = createInvoiceCommandHandler;
        this.updateInvoiceCommandHandler = updateInvoiceCommandHandler;
        this.markInvoiceAsSentCommandHandler = markInvoiceAsSentCommandHandler;
        this.recordPaymentCommandHandler = recordPaymentCommandHandler;
        this.cancelInvoiceCommandHandler = cancelInvoiceCommandHandler;
        this.getInvoiceByIdQueryHandler = getInvoiceByIdQueryHandler;
        this.listInvoicesQueryHandler = listInvoicesQueryHandler;
    }

    @PostMapping
    public ResponseEntity<InvoiceDetailDto> createInvoice(@Valid @RequestBody CreateInvoiceRequestDto request) {
        try {
            // Map request DTO to command
            CreateInvoiceCommand command = new CreateInvoiceCommand(
                    request.getCustomerId(),
                    request.getInvoiceDate(),
                    request.getDueDate(),
                    request.getLineItems().stream()
                            .map(dto -> new CreateInvoiceCommand.LineItemDto(
                                    dto.getDescription(),
                                    dto.getQuantity(),
                                    dto.getUnitPrice()
                            ))
                            .collect(Collectors.toList()),
                    request.getTaxAmount(),
                    request.getNotes(),
                    "system" // TODO: Get from authentication context
            );

            // Handle command
            Invoice invoice = createInvoiceCommandHandler.handle(command);

            // Map domain entity to response DTO
            InvoiceDetailDto response = toInvoiceDetailDto(invoice);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (CreateInvoiceCommandHandler.CustomerNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (CreateInvoiceCommandHandler.CustomerInactiveException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException | CreateInvoiceCommandHandler.InvalidDueDateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDetailDto> updateInvoice(@PathVariable UUID id,
                                                          @Valid @RequestBody UpdateInvoiceRequestDto request) {
        try {
            // Map request DTO to command
            UpdateInvoiceCommand command = new UpdateInvoiceCommand(
                    id,
                    request.getInvoiceDate(),
                    request.getDueDate(),
                    request.getLineItems() != null ? request.getLineItems().stream()
                            .map(dto -> new UpdateInvoiceCommand.LineItemDto(
                                    dto.getDescription(),
                                    dto.getQuantity(),
                                    dto.getUnitPrice()
                            ))
                            .collect(Collectors.toList()) : null,
                    request.getTaxAmount(),
                    request.getNotes(),
                    "system" // TODO: Get from authentication context
            );

            // Handle command
            Invoice invoice = updateInvoiceCommandHandler.handle(command);

            // Map domain entity to response DTO
            InvoiceDetailDto response = toInvoiceDetailDto(invoice);

            return ResponseEntity.ok(response);
        } catch (UpdateInvoiceCommandHandler.InvoiceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (UpdateInvoiceCommandHandler.InvoiceNotDraftException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{id}/mark-as-sent")
    public ResponseEntity<InvoiceDetailDto> markInvoiceAsSent(@PathVariable UUID id,
                                                              @Valid @RequestBody(required = false) MarkInvoiceAsSentRequestDto request) {
        try {
            // Map request DTO to command (request can be null/empty)
            MarkInvoiceAsSentCommand command = new MarkInvoiceAsSentCommand(
                    id,
                    request != null ? request.getSentDate() : null,
                    "system" // TODO: Get from authentication context
            );

            // Handle command
            Invoice invoice = markInvoiceAsSentCommandHandler.handle(command);

            // Map domain entity to response DTO
            InvoiceDetailDto response = toInvoiceDetailDto(invoice);

            return ResponseEntity.ok(response);
        } catch (MarkInvoiceAsSentCommandHandler.InvoiceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (MarkInvoiceAsSentCommandHandler.InvoiceNotDraftException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    private InvoiceDetailDto toInvoiceDetailDto(Invoice invoice) {
        InvoiceDetailDto dto = new InvoiceDetailDto();
        dto.setId(invoice.getId());
        dto.setCustomerId(invoice.getCustomerId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setStatus(invoice.getStatus());
        dto.setSubtotal(invoice.getSubtotal());
        dto.setTaxAmount(invoice.getTaxAmount());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setPaidAmount(invoice.getPaidAmount());
        dto.setBalance(invoice.getBalance());
        dto.setNotes(invoice.getNotes());
        dto.setCreatedAt(invoice.getAuditInfo().getCreatedAt().toString());
        dto.setLastModifiedAt(invoice.getAuditInfo().getLastModifiedAt().toString());
        dto.setCreatedBy(invoice.getAuditInfo().getCreatedBy());
        dto.setLastModifiedBy(invoice.getAuditInfo().getLastModifiedBy());

        dto.setLineItems(invoice.getLineItems().stream()
                .map(item -> {
                    InvoiceDetailDto.LineItemDto lineItemDto = new InvoiceDetailDto.LineItemDto();
                    lineItemDto.setDescription(item.getDescription());
                    lineItemDto.setQuantity(item.getQuantity());
                    lineItemDto.setUnitPrice(item.getUnitPrice());
                    lineItemDto.setLineTotal(item.getLineTotal());
                    return lineItemDto;
                })
                .collect(Collectors.toList()));

        return dto;
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDetailDto> getInvoiceById(@PathVariable UUID id) {
        try {
            GetInvoiceByIdQuery query = new GetInvoiceByIdQuery(id);
            InvoiceDetailDto response = getInvoiceByIdQueryHandler.handle(query);
            return ResponseEntity.ok(response);
        } catch (GetInvoiceByIdQueryHandler.InvoiceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    public ResponseEntity<PagedInvoiceListDto> listInvoices(
            @RequestParam(required = false) UUID customerId,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Boolean overdue,
            @RequestParam(required = false, defaultValue = "invoiceDate") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false, defaultValue = "0") Integer pageNumber,
            @RequestParam(required = false, defaultValue = "20") Integer pageSize) {
        
        ListInvoicesQuery query = new ListInvoicesQuery();
        query.setCustomerId(customerId);
        query.setStatus(status);
        query.setFromDate(fromDate);
        query.setToDate(toDate);
        query.setOverdue(overdue);
        query.setSortBy(sortBy);
        query.setSortDirection("ASC".equalsIgnoreCase(sortDirection) ? 
            ListInvoicesQuery.SortDirection.ASC : ListInvoicesQuery.SortDirection.DESC);
        query.setPageNumber(pageNumber);
        query.setPageSize(pageSize);

        PagedInvoiceListDto response = listInvoicesQueryHandler.handle(query);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<PaymentDetailDto> recordPayment(@PathVariable UUID id,
                                                          @Valid @RequestBody RecordPaymentRequestDto request) {
        try {
            RecordPaymentForInvoiceCommand command = new RecordPaymentForInvoiceCommand(
                    id,
                    request.getAmount(),
                    request.getPaymentDate(),
                    request.getPaymentMethod(),
                    request.getReferenceNumber(),
                    request.getNotes(),
                    "system" // TODO: Get from authentication context
            );

            Payment payment = recordPaymentCommandHandler.handle(command);
            PaymentDetailDto response = toPaymentDetailDto(payment);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RecordPaymentForInvoiceCommandHandler.InvoiceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (RecordPaymentForInvoiceCommandHandler.InvoiceNotSentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RecordPaymentForInvoiceCommandHandler.PaymentExceedsBalanceException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<InvoiceDetailDto> cancelInvoice(@PathVariable UUID id,
                                                         @Valid @RequestBody CancelInvoiceRequestDto request) {
        try {
            CancelInvoiceCommand command = new CancelInvoiceCommand(
                    id,
                    request.getCancellationReason(),
                    "system" // TODO: Get from authentication context
            );

            Invoice invoice = cancelInvoiceCommandHandler.handle(command);
            InvoiceDetailDto response = toInvoiceDetailDto(invoice);

            return ResponseEntity.ok(response);
        } catch (CancelInvoiceCommandHandler.InvoiceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (CancelInvoiceCommandHandler.CannotCancelPaidInvoiceException |
                 CancelInvoiceCommandHandler.CannotCancelInvoiceWithPaymentsException e) {
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

