package com.rapidphotoupload.infrastructure.storage;

import java.io.InputStream;

/**
 * Interface for cloud storage operations.
 * Implementation will support AWS S3 or Azure Blob Storage.
 * Implementation will be completed in Epic 1, Story 1-6.
 */
public interface CloudStorageService {
    /**
     * Upload a file to cloud storage.
     * @param key Storage key/path
     * @param inputStream File content
     * @param contentType MIME type
     * @return Storage key
     */
    String upload(String key, InputStream inputStream, String contentType);

    /**
     * Download a file from cloud storage.
     * @param key Storage key/path
     * @return File content as InputStream
     */
    InputStream download(String key);

    /**
     * Delete a file from cloud storage.
     * @param key Storage key/path
     */
    void delete(String key);

    /**
     * Build a publicly accessible URL for a stored asset.
     * Implementations must ensure the returned URL is reachable without authentication.
     * @param key Storage key/path
     * @return Public URL
     */
    String getPublicUrl(String key);

    /**
     * Generate a presigned URL for temporary access to a stored asset.
     * @param key Storage key/path
     * @param expirationMinutes Number of minutes until the URL expires
     * @return Presigned URL
     */
    String generatePresignedUrl(String key, int expirationMinutes);
}

