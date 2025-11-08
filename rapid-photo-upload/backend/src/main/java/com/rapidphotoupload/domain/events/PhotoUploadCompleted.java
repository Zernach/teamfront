package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.StorageKey;

import java.time.Instant;

/**
 * Domain event fired when a photo upload is completed successfully.
 */
public record PhotoUploadCompleted(
    PhotoId photoId,
    StorageKey storageKey,
    Instant occurredAt
) {
    public PhotoUploadCompleted {
        if (photoId == null) {
            throw new IllegalArgumentException("photoId cannot be null");
        }
        if (storageKey == null) {
            throw new IllegalArgumentException("storageKey cannot be null");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static PhotoUploadCompleted create(PhotoId photoId, StorageKey storageKey) {
        return new PhotoUploadCompleted(photoId, storageKey, Instant.now());
    }
}

