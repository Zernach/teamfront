package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.JobId;
import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.UploadedBy;

import java.time.Instant;

/**
 * Domain event fired when a photo upload is started.
 */
public record PhotoUploadStarted(
    PhotoId photoId,
    UploadedBy uploadedBy,
    JobId jobId, // Optional - null for single photo uploads
    Instant occurredAt
) {
    public PhotoUploadStarted {
        if (photoId == null) {
            throw new IllegalArgumentException("photoId cannot be null");
        }
        if (uploadedBy == null) {
            throw new IllegalArgumentException("uploadedBy cannot be null");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
        // jobId is optional and can be null for single photo uploads
    }

    public static PhotoUploadStarted create(PhotoId photoId, UploadedBy uploadedBy) {
        return new PhotoUploadStarted(photoId, uploadedBy, null, Instant.now());
    }
    
    public static PhotoUploadStarted create(PhotoId photoId, UploadedBy uploadedBy, JobId jobId) {
        return new PhotoUploadStarted(photoId, uploadedBy, jobId, Instant.now());
    }
}

