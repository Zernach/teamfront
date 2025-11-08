package com.invoiceme.features.customers.commands.deletecustomer;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import com.invoiceme.features.customers.domain.CustomerStatus;
import com.invoiceme.features.customers.domain.valueobjects.AuditInfo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class DeleteCustomerCommandHandler {
    private final CustomerRepository customerRepository;
    private final InvoiceExistenceChecker invoiceExistenceChecker;
    
    public DeleteCustomerCommandHandler(CustomerRepository customerRepository,
                                       InvoiceExistenceChecker invoiceExistenceChecker) {
        this.customerRepository = customerRepository;
        this.invoiceExistenceChecker = invoiceExistenceChecker;
    }
    
    @Transactional
    public void handle(DeleteCustomerCommand command) {
        // Load existing customer
        Customer customer = customerRepository.findById(command.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + command.getCustomerId()));
        
        // Check if customer has active invoices (SENT or PAID)
        if (invoiceExistenceChecker.hasActiveInvoices(command.getCustomerId())) {
            throw new CannotDeleteCustomerWithActiveInvoicesException(
                "Cannot delete customer with invoices in SENT or PAID status"
            );
        }
        
        if (command.isHardDelete()) {
            // Hard delete: remove from database
            // Note: This will be implemented when we have a delete method in repository
            // For now, we'll mark as DELETED and note that hard delete requires repository support
            throw new HardDeleteNotSupportedException("Hard delete not yet supported - use soft delete");
        } else {
            // Soft delete: mark as DELETED
            Customer deleted = Customer.reconstruct(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getBillingAddress(),
                customer.getTaxId(),
                CustomerStatus.DELETED,
                AuditInfo.update(customer.getAuditInfo(), command.getDeletedBy())
            );
            
            customerRepository.save(deleted);
        }
    }
    
    public static class CustomerNotFoundException extends RuntimeException {
        public CustomerNotFoundException(String message) {
            super(message);
        }
    }
    
    public static class CannotDeleteCustomerWithActiveInvoicesException extends RuntimeException {
        public CannotDeleteCustomerWithActiveInvoicesException(String message) {
            super(message);
        }
    }
    
    public static class HardDeleteNotSupportedException extends RuntimeException {
        public HardDeleteNotSupportedException(String message) {
            super(message);
        }
    }
    
    // Interface for checking invoice existence
    // This will be implemented when Invoice domain is created (Epic 2)
    public interface InvoiceExistenceChecker {
        boolean hasActiveInvoices(UUID customerId);
    }
}


