package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.UploadedBy;

import java.time.Instant;

/**
 * Domain event fired when a photo upload is started.
 */
public record PhotoUploadStarted(
    PhotoId photoId,
    UploadedBy uploadedBy,
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
    }

    public static PhotoUploadStarted create(PhotoId photoId, UploadedBy uploadedBy) {
        return new PhotoUploadStarted(photoId, uploadedBy, Instant.now());
    }
}

