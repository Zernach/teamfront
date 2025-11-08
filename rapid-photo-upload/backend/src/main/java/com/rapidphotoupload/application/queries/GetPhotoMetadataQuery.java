package com.rapidphotoupload.application.queries;

import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.UserId;

/**
 * Query to get photo metadata by photo ID.
 */
public record GetPhotoMetadataQuery(
    PhotoId photoId,
    UserId userId // For authorization check
) implements Query<com.rapidphotoupload.application.dtos.PhotoDTO> {
    public GetPhotoMetadataQuery {
        if (photoId == null) {
            throw new IllegalArgumentException("PhotoId cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
    }
}

