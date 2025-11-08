package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.JobId;

import java.time.Instant;

/**
 * Domain event fired when an upload job is completed successfully.
 */
public record UploadJobCompleted(
    JobId jobId,
    int totalPhotos,
    Instant occurredAt
) {
    public UploadJobCompleted {
        if (jobId == null) {
            throw new IllegalArgumentException("jobId cannot be null");
        }
        if (totalPhotos <= 0) {
            throw new IllegalArgumentException("totalPhotos must be greater than 0");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static UploadJobCompleted create(JobId jobId, int totalPhotos) {
        return new UploadJobCompleted(jobId, totalPhotos, Instant.now());
    }
}

