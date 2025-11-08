package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.PhotoId;

import java.time.Instant;

/**
 * Domain event fired when photo upload progress is updated.
 */
public record PhotoUploadProgressed(
    PhotoId photoId,
    int progressPercentage,
    Instant occurredAt
) {
    public PhotoUploadProgressed {
        if (photoId == null) {
            throw new IllegalArgumentException("photoId cannot be null");
        }
        if (progressPercentage < 0 || progressPercentage > 100) {
            throw new IllegalArgumentException("progressPercentage must be between 0 and 100");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static PhotoUploadProgressed create(PhotoId photoId, int progressPercentage) {
        return new PhotoUploadProgressed(photoId, progressPercentage, Instant.now());
    }
}

