package com.invoiceme.features.customers.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository {
    Customer save(Customer customer);
    
    Optional<Customer> findById(UUID id);
    
    boolean existsByEmail(String email);
    
    Optional<Customer> findByEmail(String email);
    
    List<Customer> findAll();
}



