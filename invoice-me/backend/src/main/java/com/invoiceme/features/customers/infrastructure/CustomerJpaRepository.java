package com.invoiceme.features.customers.infrastructure;

import com.invoiceme.features.customers.domain.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerJpaRepository extends JpaRepository<CustomerEntity, UUID> {
    boolean existsByEmail(String email);
    
    Optional<CustomerEntity> findByEmail(String email);
    
    Page<CustomerEntity> findByStatus(CustomerStatus status, Pageable pageable);
    
    @Query("SELECT c FROM CustomerEntity c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:searchTerm IS NULL OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<CustomerEntity> findByStatusAndSearchTerm(
        @Param("status") CustomerStatus status,
        @Param("searchTerm") String searchTerm,
        Pageable pageable
    );
}

