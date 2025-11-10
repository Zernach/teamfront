package com.invoiceme.features.customers.commands.updatecustomer;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import com.invoiceme.features.customers.domain.CustomerStatus;
import com.invoiceme.features.customers.domain.valueobjects.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UpdateCustomerCommandHandler {
    private final CustomerRepository customerRepository;
    
    public UpdateCustomerCommandHandler(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    
    @Transactional
    public Customer handle(UpdateCustomerCommand command) {
        // Load existing customer
        Customer customer = customerRepository.findById(command.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException("Customer not found: " + command.getCustomerId()));
        
        // Validate customer is not DELETED
        if (customer.getStatus() == CustomerStatus.DELETED) {
            throw new CannotUpdateDeletedCustomerException("Cannot update customer with DELETED status");
        }
        
        // Validate at least one field is provided
        if (!command.hasAnyField()) {
            throw new NoFieldsProvidedException("At least one field must be provided for update");
        }
        
        // Check email uniqueness if email is being updated
        if (command.getEmail() != null && !command.getEmail().equals(customer.getEmail().getValue())) {
            if (customerRepository.existsByEmail(command.getEmail())) {
                throw new EmailAlreadyExistsException("Email already exists: " + command.getEmail());
            }
        }
        
        // Update customer
        customer = updateCustomerFields(customer, command);
        
        // Save and return
        return customerRepository.save(customer);
    }
    
    private Customer updateCustomerFields(Customer customer, UpdateCustomerCommand command) {
        CustomerName name = command.getFirstName() != null || command.getLastName() != null
            ? CustomerName.of(
                command.getFirstName() != null ? command.getFirstName() : customer.getName().getFirstName(),
                command.getLastName() != null ? command.getLastName() : customer.getName().getLastName()
            )
            : customer.getName();
        
        EmailAddress email = command.getEmail() != null
            ? EmailAddress.of(command.getEmail())
            : customer.getEmail();
        
        PhoneNumber phone;
        if (command.getPhone() != null && !command.getPhone().isBlank()) {
            phone = PhoneNumber.of(command.getPhone());
        } else if (command.getPhone() != null && command.getPhone().isBlank()) {
            phone = PhoneNumber.empty();
        } else {
            phone = customer.getPhone();
        }
        
        Address address;
        if (command.getStreet() != null || command.getCity() != null || command.getState() != null ||
            command.getZipCode() != null || command.getCountry() != null) {
            address = Address.of(
                command.getStreet() != null ? command.getStreet() : customer.getBillingAddress().getStreet(),
                command.getCity() != null ? command.getCity() : customer.getBillingAddress().getCity(),
                command.getState() != null ? command.getState() : customer.getBillingAddress().getState(),
                command.getZipCode() != null ? command.getZipCode() : customer.getBillingAddress().getZipCode(),
                command.getCountry() != null ? command.getCountry() : customer.getBillingAddress().getCountry()
            );
        } else {
            address = customer.getBillingAddress();
        }
        
        // Create updated customer with new audit info
        Customer updated = Customer.reconstruct(
            customer.getId(),
            name,
            email,
            phone,
            address,
            customer.getStatus(),
            AuditInfo.update(customer.getAuditInfo(), command.getModifiedBy())
        );
        
        return updated;
    }
    
    public static class CustomerNotFoundException extends RuntimeException {
        public CustomerNotFoundException(String message) {
            super(message);
        }
    }
    
    public static class CannotUpdateDeletedCustomerException extends RuntimeException {
        public CannotUpdateDeletedCustomerException(String message) {
            super(message);
        }
    }
    
    public static class NoFieldsProvidedException extends RuntimeException {
        public NoFieldsProvidedException(String message) {
            super(message);
        }
    }
    
    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String message) {
            super(message);
        }
    }
}



