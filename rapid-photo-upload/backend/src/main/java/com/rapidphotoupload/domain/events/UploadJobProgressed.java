package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.JobId;

import java.time.Instant;

/**
 * Domain event fired when upload job progress is updated.
 */
public record UploadJobProgressed(
    JobId jobId,
    int completedPhotos,
    int totalPhotos,
    int progressPercentage,
    Instant occurredAt
) {
    public UploadJobProgressed {
        if (jobId == null) {
            throw new IllegalArgumentException("jobId cannot be null");
        }
        if (completedPhotos < 0) {
            throw new IllegalArgumentException("completedPhotos cannot be negative");
        }
        if (totalPhotos <= 0) {
            throw new IllegalArgumentException("totalPhotos must be greater than 0");
        }
        if (completedPhotos > totalPhotos) {
            throw new IllegalArgumentException("completedPhotos cannot exceed totalPhotos");
        }
        if (progressPercentage < 0 || progressPercentage > 100) {
            throw new IllegalArgumentException("progressPercentage must be between 0 and 100");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static UploadJobProgressed create(JobId jobId, int completedPhotos, int totalPhotos) {
        int progressPercentage = (int) Math.round((completedPhotos * 100.0) / totalPhotos);
        return new UploadJobProgressed(jobId, completedPhotos, totalPhotos, progressPercentage, Instant.now());
    }
}

