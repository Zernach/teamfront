package com.rapidphotoupload.infrastructure.storage;

import java.io.InputStream;

/**
 * Azure Blob Storage implementation of CloudStorageService.
 * Implementation will be completed in Epic 3.
 */
public class AzureBlobPhotoStorageService implements CloudStorageService {
    // TODO: Implement Azure Blob storage in Epic 3
    // This will use Azure Storage SDK for Java

    @Override
    public String upload(String key, InputStream inputStream, String contentType) {
        throw new UnsupportedOperationException("AzureBlobPhotoStorageService not yet implemented");
    }

    @Override
    public InputStream download(String key) {
        throw new UnsupportedOperationException("AzureBlobPhotoStorageService not yet implemented");
    }

    @Override
    public void delete(String key) {
        throw new UnsupportedOperationException("AzureBlobPhotoStorageService not yet implemented");
    }

    @Override
    public String getPublicUrl(String key) {
        throw new UnsupportedOperationException("AzureBlobPhotoStorageService not yet implemented");
    }

    @Override
    public String generatePresignedUrl(String key, int expirationMinutes) {
        throw new UnsupportedOperationException("AzureBlobPhotoStorageService not yet implemented");
    }
}

