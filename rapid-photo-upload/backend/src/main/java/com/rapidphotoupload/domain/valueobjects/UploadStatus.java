package com.rapidphotoupload.domain.valueobjects;

/**
 * UploadStatus enum representing the current state of a photo upload.
 */
public enum UploadStatus {
    QUEUED,
    UPLOADING,
    COMPLETED,
    FAILED,
    CANCELLED
}

