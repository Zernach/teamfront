package com.invoiceme.features.invoices.queries.getinvoicebyid;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceRepository;
import com.invoiceme.features.invoices.dto.InvoiceDetailDto;
import com.invoiceme.features.payments.domain.Payment;
import com.invoiceme.features.payments.domain.PaymentRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class GetInvoiceByIdQueryHandler {
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final PaymentRepository paymentRepository;

    public GetInvoiceByIdQueryHandler(InvoiceRepository invoiceRepository,
                                     CustomerRepository customerRepository,
                                     PaymentRepository paymentRepository) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public InvoiceDetailDto handle(GetInvoiceByIdQuery query) {
        // Load invoice
        Invoice invoice = invoiceRepository.findById(query.getInvoiceId())
                .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + query.getInvoiceId()));

        // Load customer
        Customer customer = customerRepository.findById(invoice.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found: " + invoice.getCustomerId()));

        // Load payments
        List<Payment> payments = paymentRepository.findByInvoiceId(invoice.getId());

        // Map to DTO
        return toInvoiceDetailDto(invoice, customer, payments);
    }

    private InvoiceDetailDto toInvoiceDetailDto(Invoice invoice, Customer customer, List<Payment> payments) {
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

        // Set customer summary
        InvoiceDetailDto.CustomerSummaryDto customerDto = new InvoiceDetailDto.CustomerSummaryDto();
        customerDto.setId(customer.getId());
        customerDto.setFullName(customer.getName().getFullName());
        customerDto.setEmail(customer.getEmail().getValue());
        dto.setCustomer(customerDto);

        // Set line items
        List<InvoiceDetailDto.LineItemDto> lineItemDtos = new java.util.ArrayList<>();
        for (int i = 0; i < invoice.getLineItems().size(); i++) {
            var item = invoice.getLineItems().get(i);
            InvoiceDetailDto.LineItemDto lineItemDto = new InvoiceDetailDto.LineItemDto();
            lineItemDto.setId(String.valueOf(i)); // Use index as ID
            lineItemDto.setDescription(item.getDescription());
            lineItemDto.setQuantity(item.getQuantity());
            lineItemDto.setUnitPrice(item.getUnitPrice());
            lineItemDto.setLineTotal(item.getLineTotal());
            lineItemDto.setSortOrder(i); // Use index as sortOrder
            lineItemDtos.add(lineItemDto);
        }
        dto.setLineItems(lineItemDtos);

        // Set payments
        dto.setPayments(payments.stream()
                .map(payment -> {
                    InvoiceDetailDto.PaymentSummaryDto paymentDto = new InvoiceDetailDto.PaymentSummaryDto();
                    paymentDto.setId(payment.getId());
                    paymentDto.setAmount(payment.getAmount());
                    paymentDto.setPaymentDate(payment.getPaymentDate());
                    paymentDto.setPaymentMethod(payment.getPaymentMethod().toString());
                    paymentDto.setReferenceNumber(payment.getReferenceNumber());
                    paymentDto.setStatus(payment.getStatus().toString());
                    return paymentDto;
                })
                .collect(Collectors.toList()));

        return dto;
    }

    public static class InvoiceNotFoundException extends RuntimeException {
        public InvoiceNotFoundException(String message) {
            super(message);
        }
    }
}

