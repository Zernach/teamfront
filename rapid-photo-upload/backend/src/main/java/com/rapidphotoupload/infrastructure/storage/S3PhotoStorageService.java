package com.rapidphotoupload.infrastructure.storage;

import java.io.InputStream;

/**
 * S3 implementation of CloudStorageService.
 * Implementation will be completed in Epic 3.
 */
public class S3PhotoStorageService implements CloudStorageService {
    // TODO: Implement S3 storage in Epic 3
    // This will use AWS SDK for Java S3

    @Override
    public String upload(String key, InputStream inputStream, String contentType) {
        throw new UnsupportedOperationException("S3PhotoStorageService not yet implemented");
    }

    @Override
    public InputStream download(String key) {
        throw new UnsupportedOperationException("S3PhotoStorageService not yet implemented");
    }

    @Override
    public void delete(String key) {
        throw new UnsupportedOperationException("S3PhotoStorageService not yet implemented");
    }

    @Override
    public String generatePresignedUrl(String key, int expirationMinutes) {
        throw new UnsupportedOperationException("S3PhotoStorageService not yet implemented");
    }
}

