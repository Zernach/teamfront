package com.rapidphotoupload.api.dto;

import java.util.List;

/**
 * Response DTO for batch upload endpoint.
 */
public record BatchUploadResponse(
    String jobId,
    int totalPhotos,
    List<String> photoIds
) {
    public BatchUploadResponse {
        if (jobId == null || jobId.trim().isEmpty()) {
            throw new IllegalArgumentException("JobId cannot be null or empty");
        }
        if (totalPhotos <= 0) {
            throw new IllegalArgumentException("TotalPhotos must be greater than 0");
        }
        if (photoIds == null) {
            photoIds = List.of();
        }
    }
}

