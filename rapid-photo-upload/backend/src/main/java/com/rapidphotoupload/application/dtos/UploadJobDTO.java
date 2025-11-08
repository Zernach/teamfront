package com.rapidphotoupload.application.dtos;

import com.rapidphotoupload.domain.valueobjects.JobId;
import com.rapidphotoupload.domain.valueobjects.JobStatus;

import java.time.Instant;
import java.util.List;

/**
 * Data Transfer Object for UploadJob.
 * Used for read operations and API responses.
 */
public record UploadJobDTO(
    JobId jobId,
    String userId,
    List<String> photoIds,
    int totalPhotos,
    int completedPhotos,
    int failedPhotos,
    JobStatus status,
    int progressPercentage,
    Instant createdAt,
    Instant completedAt
) {
    public UploadJobDTO {
        if (jobId == null) {
            throw new IllegalArgumentException("JobId cannot be null");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("UserId cannot be null or empty");
        }
        if (photoIds == null) {
            photoIds = List.of();
        }
        if (totalPhotos <= 0) {
            throw new IllegalArgumentException("TotalPhotos must be greater than 0");
        }
        if (completedPhotos < 0) {
            throw new IllegalArgumentException("CompletedPhotos cannot be negative");
        }
        if (failedPhotos < 0) {
            throw new IllegalArgumentException("FailedPhotos cannot be negative");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        if (progressPercentage < 0 || progressPercentage > 100) {
            throw new IllegalArgumentException("ProgressPercentage must be between 0 and 100");
        }
        if (createdAt == null) {
            throw new IllegalArgumentException("CreatedAt cannot be null");
        }
    }
}

