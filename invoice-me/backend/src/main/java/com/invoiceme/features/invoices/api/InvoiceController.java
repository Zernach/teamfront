package com.invoiceme.features.invoices.api;

import com.invoiceme.features.invoices.commands.createinvoice.CreateInvoiceCommand;
import com.invoiceme.features.invoices.commands.createinvoice.CreateInvoiceCommandHandler;
import com.invoiceme.features.invoices.commands.updateinvoice.UpdateInvoiceCommand;
import com.invoiceme.features.invoices.commands.updateinvoice.UpdateInvoiceCommandHandler;
import com.invoiceme.features.invoices.commands.markinvoiceassent.MarkInvoiceAsSentCommand;
import com.invoiceme.features.invoices.commands.markinvoiceassent.MarkInvoiceAsSentCommandHandler;
import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.dto.CreateInvoiceRequestDto;
import com.invoiceme.features.invoices.dto.InvoiceDetailDto;
import com.invoiceme.features.invoices.dto.UpdateInvoiceRequestDto;
import com.invoiceme.features.invoices.dto.MarkInvoiceAsSentRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {
    private final CreateInvoiceCommandHandler createInvoiceCommandHandler;
    private final UpdateInvoiceCommandHandler updateInvoiceCommandHandler;
    private final MarkInvoiceAsSentCommandHandler markInvoiceAsSentCommandHandler;

    public InvoiceController(CreateInvoiceCommandHandler createInvoiceCommandHandler,
                            UpdateInvoiceCommandHandler updateInvoiceCommandHandler,
                            MarkInvoiceAsSentCommandHandler markInvoiceAsSentCommandHandler) {
        this.createInvoiceCommandHandler = createInvoiceCommandHandler;
        this.updateInvoiceCommandHandler = updateInvoiceCommandHandler;
        this.markInvoiceAsSentCommandHandler = markInvoiceAsSentCommandHandler;
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
        } catch (IllegalArgumentException | CreateInvoiceCommandHandler.InvalidInvoiceDateException |
                 CreateInvoiceCommandHandler.InvalidDueDateException e) {
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
}

