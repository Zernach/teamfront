package com.rapidphotoupload.application.dtos;

import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.UploadStatus;
import com.rapidphotoupload.domain.valueobjects.StorageKey;

import java.time.Instant;
import java.util.Set;

/**
 * Data Transfer Object for Photo.
 * Used for read operations and API responses.
 * Separate from domain model to avoid exposing internal structure.
 */
public record PhotoDTO(
    PhotoId photoId,
    String filename,
    long fileSize,
    String contentType,
    UploadStatus status,
    String storageKey,
    String thumbnailStorageKey,
    Instant uploadedAt,
    String uploadedByUserId,
    Set<String> tags,
    Integer width,
    Integer height,
    String fileHash
) {
    public PhotoDTO {
        if (photoId == null) {
            throw new IllegalArgumentException("PhotoId cannot be null");
        }
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Filename cannot be null or empty");
        }
        if (fileSize <= 0) {
            throw new IllegalArgumentException("FileSize must be greater than 0");
        }
        if (contentType == null || contentType.trim().isEmpty()) {
            throw new IllegalArgumentException("ContentType cannot be null or empty");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        if (uploadedAt == null) {
            throw new IllegalArgumentException("UploadedAt cannot be null");
        }
        if (uploadedByUserId == null || uploadedByUserId.trim().isEmpty()) {
            throw new IllegalArgumentException("UploadedByUserId cannot be null or empty");
        }
        if (tags == null) {
            tags = Set.of();
        }
    }
}

