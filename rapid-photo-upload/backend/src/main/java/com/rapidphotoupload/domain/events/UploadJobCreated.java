package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.JobId;
import com.rapidphotoupload.domain.valueobjects.UserId;

import java.time.Instant;

/**
 * Domain event fired when an upload job is created.
 */
public record UploadJobCreated(
    JobId jobId,
    UserId userId,
    int totalPhotos,
    Instant occurredAt
) {
    public UploadJobCreated {
        if (jobId == null) {
            throw new IllegalArgumentException("jobId cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }
        if (totalPhotos <= 0) {
            throw new IllegalArgumentException("totalPhotos must be greater than 0");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static UploadJobCreated create(JobId jobId, UserId userId, int totalPhotos) {
        return new UploadJobCreated(jobId, userId, totalPhotos, Instant.now());
    }
}

