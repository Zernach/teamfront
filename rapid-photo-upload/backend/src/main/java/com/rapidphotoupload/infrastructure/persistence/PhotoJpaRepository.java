package com.rapidphotoupload.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for PhotoEntity.
 */
@Repository
public interface PhotoJpaRepository extends JpaRepository<PhotoEntity, UUID> {
    List<PhotoEntity> findByUserId(UUID userId);
    
    @Query("SELECT p FROM PhotoEntity p WHERE p.userId = :userId AND p.status = :status")
    List<PhotoEntity> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);
    
    List<PhotoEntity> findByStatus(String status);
}

