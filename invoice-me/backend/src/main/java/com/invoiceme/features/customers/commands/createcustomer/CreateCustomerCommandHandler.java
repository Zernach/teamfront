package com.invoiceme.features.customers.commands.createcustomer;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import com.invoiceme.features.customers.domain.valueobjects.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreateCustomerCommandHandler {
    private final CustomerRepository customerRepository;
    
    public CreateCustomerCommandHandler(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    
    @Transactional
    public Customer handle(CreateCustomerCommand command) {
        // Validate email uniqueness
        if (customerRepository.existsByEmail(command.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists: " + command.getEmail());
        }
        
        // Create value objects
        CustomerName name = CustomerName.of(command.getFirstName(), command.getLastName());
        EmailAddress email = EmailAddress.of(command.getEmail());
        PhoneNumber phone = command.getPhone() != null && !command.getPhone().isBlank() 
            ? PhoneNumber.of(command.getPhone()) 
            : PhoneNumber.empty();
        Address address = Address.of(
            command.getStreet(),
            command.getCity(),
            command.getState(),
            command.getZipCode(),
            command.getCountry()
        );
        
        // Create customer
        Customer customer = Customer.create(
            name,
            email,
            phone,
            address,
            command.getCreatedBy()
        );
        
        // Save and return
        return customerRepository.save(customer);
    }
    
    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String message) {
            super(message);
        }
    }
}



