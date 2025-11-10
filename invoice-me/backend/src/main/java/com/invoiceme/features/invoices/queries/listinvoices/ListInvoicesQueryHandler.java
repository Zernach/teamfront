package com.invoiceme.features.invoices.queries.listinvoices;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import com.invoiceme.features.invoices.domain.Invoice;
import com.invoiceme.features.invoices.domain.InvoiceRepository;
import com.invoiceme.features.invoices.domain.InvoiceStatus;
import com.invoiceme.features.invoices.dto.InvoiceSummaryDto;
import com.invoiceme.features.invoices.dto.PagedInvoiceListDto;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class ListInvoicesQueryHandler {
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;

    public ListInvoicesQueryHandler(InvoiceRepository invoiceRepository,
                                    CustomerRepository customerRepository) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public PagedInvoiceListDto handle(ListInvoicesQuery query) {
        // Get all invoices (simplified - will be optimized with proper repository methods)
        List<Invoice> allInvoices = invoiceRepository.findAll();

        // Apply filters
        List<Invoice> filtered = allInvoices.stream()
                .filter(invoice -> {
                    if (query.getCustomerId() != null && !invoice.getCustomerId().equals(query.getCustomerId())) {
                        return false;
                    }
                    if (query.getStatus() != null && invoice.getStatus() != query.getStatus()) {
                        return false;
                    }
                    if (query.getFromDate() != null && invoice.getInvoiceDate().isBefore(query.getFromDate())) {
                        return false;
                    }
                    if (query.getToDate() != null && invoice.getInvoiceDate().isAfter(query.getToDate())) {
                        return false;
                    }
                    if (query.getOverdue() != null && query.getOverdue()) {
                        LocalDate today = LocalDate.now();
                        if (!(invoice.getDueDate().isBefore(today) &&
                              invoice.getBalance().compareTo(BigDecimal.ZERO) > 0 &&
                              invoice.getStatus() == InvoiceStatus.SENT)) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());

        // Apply sorting
        if (query.getSortBy() != null) {
            filtered.sort((a, b) -> {
                int comparison = 0;
                switch (query.getSortBy().toLowerCase()) {
                    case "invoicenumber":
                        comparison = compareStrings(a.getInvoiceNumber(), b.getInvoiceNumber());
                        break;
                    case "invoicedate":
                        comparison = a.getInvoiceDate().compareTo(b.getInvoiceDate());
                        break;
                    case "duedate":
                        comparison = a.getDueDate().compareTo(b.getDueDate());
                        break;
                    case "totalamount":
                        comparison = a.getTotalAmount().compareTo(b.getTotalAmount());
                        break;
                    case "balance":
                        comparison = a.getBalance().compareTo(b.getBalance());
                        break;
                    default:
                        comparison = a.getInvoiceDate().compareTo(b.getInvoiceDate());
                }
                return query.getSortDirection() == ListInvoicesQuery.SortDirection.ASC ? comparison : -comparison;
            });
        }

        // Calculate totals
        BigDecimal totalAmountSum = filtered.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalBalanceSum = filtered.stream()
                .map(Invoice::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Apply pagination
        int pageNumber = query.getPageNumber() != null ? query.getPageNumber() : 0;
        int pageSize = query.getPageSize() != null ? Math.min(query.getPageSize(), 100) : 20;
        int start = pageNumber * pageSize;
        int end = Math.min(start + pageSize, filtered.size());
        List<Invoice> paged = start < filtered.size() ? filtered.subList(start, end) : List.of();

        // Load customers for mapping
        Map<UUID, Customer> customers = customerRepository.findAll().stream()
                .collect(Collectors.toMap(c -> c.getId(), c -> c));

        // Map to DTOs
        List<InvoiceSummaryDto> invoiceDtos = paged.stream()
                .map(invoice -> toInvoiceSummaryDto(invoice, customers.get(invoice.getCustomerId())))
                .collect(Collectors.toList());

        // Create response
        PagedInvoiceListDto response = new PagedInvoiceListDto();
        response.setInvoices(invoiceDtos);
        response.setTotalCount(filtered.size());
        response.setPageNumber(pageNumber);
        response.setPageSize(pageSize);
        response.setTotalPages((int) Math.ceil((double) filtered.size() / pageSize));
        response.setTotalAmountSum(totalAmountSum);
        response.setTotalBalanceSum(totalBalanceSum);

        return response;
    }

    private InvoiceSummaryDto toInvoiceSummaryDto(Invoice invoice, Customer customer) {
        InvoiceSummaryDto dto = new InvoiceSummaryDto();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setCustomerName(customer != null ? customer.getName().getFullName() : "Unknown");
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setStatus(invoice.getStatus().toString());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setBalance(invoice.getBalance());

        // Calculate overdue
        LocalDate today = LocalDate.now();
        dto.setOverdue(invoice.getDueDate().isBefore(today) &&
                       invoice.getBalance().compareTo(BigDecimal.ZERO) > 0 &&
                       invoice.getStatus() == InvoiceStatus.SENT);

        return dto;
    }

    private int compareStrings(String a, String b) {
        if (a == null && b == null) return 0;
        if (a == null) return -1;
        if (b == null) return 1;
        return a.compareTo(b);
    }
}

