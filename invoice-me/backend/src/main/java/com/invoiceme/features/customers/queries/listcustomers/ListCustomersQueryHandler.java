package com.invoiceme.features.customers.queries.listcustomers;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import com.invoiceme.features.customers.domain.CustomerStatus;
import com.invoiceme.features.customers.dto.CustomerSummaryDto;
import com.invoiceme.features.customers.dto.PagedCustomerListDto;
import com.invoiceme.features.customers.infrastructure.CustomerEntity;
import com.invoiceme.features.customers.infrastructure.CustomerJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ListCustomersQueryHandler {
    private final CustomerJpaRepository jpaRepository;
    private final AccountSummaryCalculator accountSummaryCalculator;
    
    public ListCustomersQueryHandler(CustomerJpaRepository jpaRepository,
                                     AccountSummaryCalculator accountSummaryCalculator) {
        this.jpaRepository = jpaRepository;
        this.accountSummaryCalculator = accountSummaryCalculator;
    }
    
    @Transactional(readOnly = true)
    public PagedCustomerListDto handle(ListCustomersQuery query) {
        // Validate and normalize page size
        int pageSize = Math.min(Math.max(query.getPageSize(), 1), 100);
        int pageNumber = Math.max(query.getPageNumber(), 0);
        
        // Build sort
        Sort sort = buildSort(query.getSortBy(), query.getSortDirection());
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Execute query
        Page<CustomerEntity> page;
        if (query.getStatus() != null || (query.getSearchTerm() != null && !query.getSearchTerm().isBlank())) {
            CustomerStatus status = query.getStatus();
            String searchTerm = query.getSearchTerm() != null && !query.getSearchTerm().isBlank() 
                ? query.getSearchTerm() 
                : null;
            page = jpaRepository.findByStatusAndSearchTerm(status, searchTerm, pageable);
        } else {
            page = jpaRepository.findAll(pageable);
        }
        
        // Map to DTOs
        List<CustomerSummaryDto> customers = page.getContent().stream()
            .map(entity -> {
                CustomerSummaryDto dto = new CustomerSummaryDto();
                dto.setId(entity.getId().toString());
                dto.setFullName(entity.getFirstName() + " " + entity.getLastName());
                dto.setEmail(entity.getEmail());
                dto.setStatus(entity.getStatus().name());
                
                // Calculate account summary (placeholder until Epic 2)
                AccountSummary summary = accountSummaryCalculator.calculate(entity.getId());
                dto.setOutstandingBalance(summary.getOutstandingBalance());
                dto.setActiveInvoicesCount(summary.getActiveInvoicesCount());
                
                return dto;
            })
            .collect(Collectors.toList());
        
        // Build response
        PagedCustomerListDto response = new PagedCustomerListDto();
        response.setCustomers(customers);
        response.setTotalCount((int) page.getTotalElements());
        response.setPageNumber(pageNumber);
        response.setPageSize(pageSize);
        response.setTotalPages(page.getTotalPages());
        
        return response;
    }
    
    private Sort buildSort(String sortBy, String sortDirection) {
        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "name";
        }
        
        Sort.Direction direction = "DESC".equalsIgnoreCase(sortDirection) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        
        switch (sortBy.toLowerCase()) {
            case "email":
                return Sort.by(direction, "email");
            case "createdat":
                return Sort.by(direction, "createdAt");
            case "name":
            default:
                return Sort.by(direction, "lastName", "firstName");
        }
    }
    
    // Account summary data
    public static class AccountSummary {
        private BigDecimal outstandingBalance;
        private int activeInvoicesCount;
        
        public AccountSummary(BigDecimal outstandingBalance, int activeInvoicesCount) {
            this.outstandingBalance = outstandingBalance;
            this.activeInvoicesCount = activeInvoicesCount;
        }
        
        public BigDecimal getOutstandingBalance() {
            return outstandingBalance;
        }
        
        public int getActiveInvoicesCount() {
            return activeInvoicesCount;
        }
    }
    
    // Interface for calculating account summary
    // This will be implemented when Invoice domain is created (Epic 2)
    public interface AccountSummaryCalculator {
        AccountSummary calculate(java.util.UUID customerId);
    }
}

