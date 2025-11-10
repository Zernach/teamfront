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
        // Check if any address field is provided (not null and not blank)
        boolean hasStreet = command.getStreet() != null && !command.getStreet().isBlank();
        boolean hasCity = command.getCity() != null && !command.getCity().isBlank();
        boolean hasState = command.getState() != null && !command.getState().isBlank();
        boolean hasZipCode = command.getZipCode() != null && !command.getZipCode().isBlank();
        boolean hasCountry = command.getCountry() != null && !command.getCountry().isBlank();
        
        if (hasStreet || hasCity || hasState || hasZipCode || hasCountry) {
            address = Address.of(
                hasStreet ? command.getStreet() : customer.getBillingAddress().getStreet(),
                hasCity ? command.getCity() : customer.getBillingAddress().getCity(),
                hasState ? command.getState() : customer.getBillingAddress().getState(),
                hasZipCode ? command.getZipCode() : customer.getBillingAddress().getZipCode(),
                hasCountry ? command.getCountry() : customer.getBillingAddress().getCountry()
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



