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
    @Query("SELECT p FROM PhotoEntity p WHERE p.userId = :userId ORDER BY p.uploadedAt DESC")
    List<PhotoEntity> findByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT p FROM PhotoEntity p WHERE p.userId = :userId AND p.status = :status ORDER BY p.uploadedAt DESC")
    List<PhotoEntity> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);
    
    @Query("SELECT p FROM PhotoEntity p WHERE p.status = :status ORDER BY p.uploadedAt DESC")
    List<PhotoEntity> findByStatus(@Param("status") String status);
}

