package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.PhotoId;

import java.time.Instant;

/**
 * Domain event fired when a photo upload fails.
 */
public record PhotoUploadFailed(
    PhotoId photoId,
    String errorMessage,
    Instant occurredAt
) {
    public PhotoUploadFailed {
        if (photoId == null) {
            throw new IllegalArgumentException("photoId cannot be null");
        }
        if (errorMessage == null || errorMessage.trim().isEmpty()) {
            throw new IllegalArgumentException("errorMessage cannot be null or empty");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static PhotoUploadFailed create(PhotoId photoId, String errorMessage) {
        return new PhotoUploadFailed(photoId, errorMessage, Instant.now());
    }
}

