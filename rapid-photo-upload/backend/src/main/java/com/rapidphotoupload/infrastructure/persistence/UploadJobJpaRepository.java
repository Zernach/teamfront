package com.rapidphotoupload.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for UploadJobEntity.
 */
@Repository
public interface UploadJobJpaRepository extends JpaRepository<UploadJobEntity, UUID> {
    List<UploadJobEntity> findByUserId(UUID userId);
    
    @Query("SELECT u FROM UploadJobEntity u WHERE u.userId = :userId AND u.status = :status")
    List<UploadJobEntity> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);
    
    List<UploadJobEntity> findByStatus(String status);
}

