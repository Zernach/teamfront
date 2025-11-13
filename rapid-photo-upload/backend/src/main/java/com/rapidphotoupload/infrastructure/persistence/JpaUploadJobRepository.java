package com.rapidphotoupload.infrastructure.persistence;

import com.rapidphotoupload.domain.aggregates.UploadJob;
import com.rapidphotoupload.domain.repositories.UploadJobRepository;
import com.rapidphotoupload.domain.valueobjects.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Infrastructure implementation of UploadJobRepository using JPA.
 */
@Component
public class JpaUploadJobRepository implements UploadJobRepository {
    
    private static final Logger logger = LoggerFactory.getLogger(JpaUploadJobRepository.class);
    
    private final UploadJobJpaRepository jpaRepository;
    
    public JpaUploadJobRepository(UploadJobJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }
    
    @Override
    public void save(UploadJob job) {
        logger.debug("Saving upload job: {}", job.getId().getValue());
        UploadJobEntity entity = toEntity(job);
        logger.info("Saving upload job entity - ID: {}, UserID: {}, TotalPhotos: {}",
            entity.getId(), entity.getUserId(), entity.getTotalPhotos());
        jpaRepository.save(entity);
        logger.debug("Upload job saved successfully: {}", job.getId().getValue());
    }
    
    @Override
    public Optional<UploadJob> findById(JobId jobId) {
        logger.debug("Finding upload job by ID: {}", jobId.getValue());
        return jpaRepository.findById(jobId.getValue())
            .map(this::toDomain);
    }
    
    @Override
    public List<UploadJob> findByUserId(UserId userId) {
        logger.debug("Finding upload jobs by user ID: {}", userId.getValue());
        return jpaRepository.findByUserId(userId.getValue())
            .stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<UploadJob> findByUserIdAndStatus(UserId userId, JobStatus status) {
        logger.debug("Finding upload jobs by user ID: {} and status: {}", userId.getValue(), status);
        return jpaRepository.findByUserIdAndStatus(userId.getValue(), status.name())
            .stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<UploadJob> findByStatus(JobStatus status) {
        logger.debug("Finding upload jobs by status: {}", status);
        return jpaRepository.findByStatus(status.name())
            .stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public void delete(JobId jobId) {
        logger.debug("Deleting upload job: {}", jobId.getValue());
        jpaRepository.deleteById(jobId.getValue());
        logger.debug("Upload job deleted successfully: {}", jobId.getValue());
    }
    
    private UploadJobEntity toEntity(UploadJob job) {
        UploadJobEntity entity = new UploadJobEntity();
        entity.setId(job.getId().getValue());
        entity.setUserId(job.getUserId().getValue());
        entity.setTotalPhotos(job.getTotalPhotos().getValue());
        entity.setCompletedPhotos(job.getCompletedPhotos().getValue());
        entity.setFailedPhotos(job.getFailedPhotos().getValue());
        entity.setStatus(job.getStatus().name());
        entity.setCreatedAt(job.getCreatedAt().getValue());
        // Null check: completedAt is null when job is first created
        if (job.getCompletedAt() != null && job.getCompletedAt().isCompleted()) {
            entity.setCompletedAt(job.getCompletedAt().getValue());
        }
        return entity;
    }
    
    private UploadJob toDomain(UploadJobEntity entity) {
        // Reconstruct UploadJob aggregate from entity
        JobId jobId = JobId.from(entity.getId());
        UserId userId = UserId.from(entity.getUserId());
        TotalPhotos totalPhotos = TotalPhotos.from(entity.getTotalPhotos());
        CompletedPhotos completedPhotos = CompletedPhotos.from(entity.getCompletedPhotos());
        FailedPhotos failedPhotos = FailedPhotos.from(entity.getFailedPhotos());
        JobStatus status = JobStatus.valueOf(entity.getStatus());
        CreatedAt createdAt = CreatedAt.from(entity.getCreatedAt());
        CompletedAt completedAt = entity.getCompletedAt() != null 
            ? CompletedAt.from(entity.getCompletedAt()) 
            : CompletedAt.empty();
        
        // Note: Photos list is not persisted in the current schema
        // This will be empty when reconstructing from database
        // TODO: Add photos persistence (JSON column or separate table)
        List<PhotoId> photos = List.of();
        
        return UploadJob.reconstruct(
            jobId,
            userId,
            photos,
            totalPhotos,
            completedPhotos,
            failedPhotos,
            status,
            createdAt,
            completedAt
        );
    }
}

