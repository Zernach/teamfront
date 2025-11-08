package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.JobId;

import java.time.Instant;

/**
 * Domain event fired when an upload job fails.
 */
public record UploadJobFailed(
    JobId jobId,
    String errorMessage,
    Instant occurredAt
) {
    public UploadJobFailed {
        if (jobId == null) {
            throw new IllegalArgumentException("jobId cannot be null");
        }
        if (errorMessage == null || errorMessage.trim().isEmpty()) {
            throw new IllegalArgumentException("errorMessage cannot be null or empty");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static UploadJobFailed create(JobId jobId, String errorMessage) {
        return new UploadJobFailed(jobId, errorMessage, Instant.now());
    }
}

