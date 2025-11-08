package com.invoiceme.features.customers.infrastructure;

import com.invoiceme.features.customers.domain.Customer;
import com.invoiceme.features.customers.domain.CustomerRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public class CustomerRepositoryImpl implements CustomerRepository {
    private final CustomerJpaRepository jpaRepository;
    
    public CustomerRepositoryImpl(CustomerJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }
    
    @Override
    public Customer save(Customer customer) {
        CustomerEntity entity = jpaRepository.findById(customer.getId())
            .map(existing -> {
                // Update existing entity
                existing.setFirstName(customer.getName().getFirstName());
                existing.setLastName(customer.getName().getLastName());
                existing.setEmail(customer.getEmail().getValue());
                existing.setPhone(customer.getPhone().isEmpty() ? null : customer.getPhone().getValue());
                existing.setStreet(customer.getBillingAddress().getStreet());
                existing.setCity(customer.getBillingAddress().getCity());
                existing.setState(customer.getBillingAddress().getState());
                existing.setZipCode(customer.getBillingAddress().getZipCode());
                existing.setCountry(customer.getBillingAddress().getCountry());
                existing.setTaxId(customer.getTaxId().isEmpty() ? null : customer.getTaxId().getValue());
                existing.setStatus(customer.getStatus());
                existing.setCreatedAt(customer.getAuditInfo().getCreatedAt());
                existing.setLastModifiedAt(customer.getAuditInfo().getLastModifiedAt());
                existing.setCreatedBy(customer.getAuditInfo().getCreatedBy());
                existing.setLastModifiedBy(customer.getAuditInfo().getLastModifiedBy());
                return existing;
            })
            .orElse(new CustomerEntity(customer));
        
        CustomerEntity saved = jpaRepository.save(entity);
        return saved.toDomain();
    }
    
    @Override
    public Optional<Customer> findById(UUID id) {
        return jpaRepository.findById(id)
            .map(CustomerEntity::toDomain);
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email.toLowerCase());
    }
    
    @Override
    public Optional<Customer> findByEmail(String email) {
        return jpaRepository.findByEmail(email.toLowerCase())
            .map(CustomerEntity::toDomain);
    }
}

