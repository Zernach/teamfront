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
    
    @Query(value = "SELECT * FROM customers c WHERE " +
           "(:status IS NULL OR c.status = CAST(:status AS VARCHAR)) AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(c.first_name) LIKE '%' || LOWER(CAST(:searchTerm AS VARCHAR)) || '%' OR " +
           "LOWER(c.last_name) LIKE '%' || LOWER(CAST(:searchTerm AS VARCHAR)) || '%' OR " +
           "LOWER(c.email) LIKE '%' || LOWER(CAST(:searchTerm AS VARCHAR)) || '%')",
           nativeQuery = true,
           countQuery = "SELECT COUNT(*) FROM customers c WHERE " +
           "(:status IS NULL OR c.status = CAST(:status AS VARCHAR)) AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(c.first_name) LIKE '%' || LOWER(CAST(:searchTerm AS VARCHAR)) || '%' OR " +
           "LOWER(c.last_name) LIKE '%' || LOWER(CAST(:searchTerm AS VARCHAR)) || '%' OR " +
           "LOWER(c.email) LIKE '%' || LOWER(CAST(:searchTerm AS VARCHAR)) || '%')")
    Page<CustomerEntity> findByStatusAndSearchTerm(
        @Param("status") String status,
        @Param("searchTerm") String searchTerm,
        Pageable pageable
    );
}

