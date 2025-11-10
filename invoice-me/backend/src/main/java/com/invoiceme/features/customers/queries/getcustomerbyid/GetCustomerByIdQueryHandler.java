package com.invoiceme.features.customers.queries.getcustomerbyid;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import com.invoiceme.features.customers.dto.CustomerDetailDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class GetCustomerByIdQueryHandler {
    private final CustomerRepository customerRepository;
    private final AccountSummaryCalculator accountSummaryCalculator;
    
    public GetCustomerByIdQueryHandler(CustomerRepository customerRepository,
                                      AccountSummaryCalculator accountSummaryCalculator) {
        this.customerRepository = customerRepository;
        this.accountSummaryCalculator = accountSummaryCalculator;
    }
    
    @Transactional(readOnly = true)
    public CustomerDetailDto handle(GetCustomerByIdQuery query) {
        Customer customer = customerRepository.findById(query.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + query.getCustomerId()));
        
        CustomerDetailDto dto = mapToDto(customer);
        
        // Add account summary
        AccountSummary summary = accountSummaryCalculator.calculate(customer.getId());
        dto.setTotalInvoicesCount(summary.getTotalInvoicesCount());
        dto.setTotalInvoicedAmount(summary.getTotalInvoicedAmount());
        dto.setTotalPaidAmount(summary.getTotalPaidAmount());
        dto.setOutstandingBalance(summary.getOutstandingBalance());
        
        return dto;
    }
    
    private CustomerDetailDto mapToDto(Customer customer) {
        CustomerDetailDto dto = new CustomerDetailDto();
        dto.setId(customer.getId());
        dto.setFullName(customer.getName().getFullName());
        dto.setEmail(customer.getEmail().getValue());
        dto.setPhone(customer.getPhone().isEmpty() ? null : customer.getPhone().getValue());
        
        com.invoiceme.features.customers.dto.AddressDto addressDto = new com.invoiceme.features.customers.dto.AddressDto();
        addressDto.setStreet(customer.getBillingAddress().getStreet());
        addressDto.setCity(customer.getBillingAddress().getCity());
        addressDto.setState(customer.getBillingAddress().getState());
        addressDto.setZipCode(customer.getBillingAddress().getZipCode());
        addressDto.setCountry(customer.getBillingAddress().getCountry());
        dto.setBillingAddress(addressDto);
        
        dto.setStatus(customer.getStatus().name());
        dto.setCreatedAt(customer.getAuditInfo().getCreatedAt());
        dto.setLastModifiedAt(customer.getAuditInfo().getLastModifiedAt());
        
        return dto;
    }
    
    public static class CustomerNotFoundException extends RuntimeException {
        public CustomerNotFoundException(String message) {
            super(message);
        }
    }
    
    // Account summary data
    public static class AccountSummary {
        private int totalInvoicesCount;
        private java.math.BigDecimal totalInvoicedAmount;
        private java.math.BigDecimal totalPaidAmount;
        private java.math.BigDecimal outstandingBalance;
        
        public AccountSummary(int totalInvoicesCount, java.math.BigDecimal totalInvoicedAmount,
                             java.math.BigDecimal totalPaidAmount, java.math.BigDecimal outstandingBalance) {
            this.totalInvoicesCount = totalInvoicesCount;
            this.totalInvoicedAmount = totalInvoicedAmount;
            this.totalPaidAmount = totalPaidAmount;
            this.outstandingBalance = outstandingBalance;
        }
        
        public int getTotalInvoicesCount() {
            return totalInvoicesCount;
        }
        
        public java.math.BigDecimal getTotalInvoicedAmount() {
            return totalInvoicedAmount;
        }
        
        public java.math.BigDecimal getTotalPaidAmount() {
            return totalPaidAmount;
        }
        
        public java.math.BigDecimal getOutstandingBalance() {
            return outstandingBalance;
        }
    }
    
    // Interface for calculating account summary
    // This will be implemented when Invoice domain is created (Epic 2)
    public interface AccountSummaryCalculator {
        AccountSummary calculate(UUID customerId);
    }
}



