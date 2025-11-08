package com.rapidphotoupload.domain.repositories;

import com.rapidphotoupload.domain.aggregates.UploadJob;
import com.rapidphotoupload.domain.valueobjects.JobId;
import com.rapidphotoupload.domain.valueobjects.JobStatus;
import com.rapidphotoupload.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UploadJob aggregate.
 * This is a domain contract, implementation will be in infrastructure layer.
 */
public interface UploadJobRepository {
    /**
     * Save an upload job aggregate.
     */
    void save(UploadJob job);

    /**
     * Find upload job by ID.
     */
    Optional<UploadJob> findById(JobId jobId);

    /**
     * Find all upload jobs for a user.
     */
    List<UploadJob> findByUserId(UserId userId);

    /**
     * Find upload jobs by user and status.
     */
    List<UploadJob> findByUserIdAndStatus(UserId userId, JobStatus status);

    /**
     * Find upload jobs by status.
     */
    List<UploadJob> findByStatus(JobStatus status);

    /**
     * Delete an upload job.
     */
    void delete(JobId jobId);
}

