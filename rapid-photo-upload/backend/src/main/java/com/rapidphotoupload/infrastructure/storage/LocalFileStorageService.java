package com.rapidphotoupload.infrastructure.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Local file system implementation of CloudStorageService.
 * Used for development/testing when S3 is not available.
 * Files are stored in a local directory.
 * Note: This is instantiated as a bean in AsyncConfig, not via @Service.
 */
public class LocalFileStorageService implements CloudStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(LocalFileStorageService.class);
    
    private final Path storageDirectory;
    
    public LocalFileStorageService(String storageDir) {
        this.storageDirectory = Paths.get(storageDir);
        try {
            Files.createDirectories(storageDirectory);
            logger.info("Local file storage initialized at: {}", storageDirectory.toAbsolutePath());
        } catch (IOException e) {
            logger.error("Failed to create storage directory: {}", storageDirectory, e);
            throw new RuntimeException("Failed to initialize local file storage", e);
        }
    }
    
    @Override
    public String upload(String key, InputStream inputStream, String contentType) {
        try {
            Path filePath = storageDirectory.resolve(key);
            Files.createDirectories(filePath.getParent());
            
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            
            logger.debug("File uploaded to local storage: {}", filePath);
            return key;
        } catch (IOException e) {
            logger.error("Failed to upload file to local storage: {}", key, e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }
    
    @Override
    public InputStream download(String key) {
        try {
            Path filePath = storageDirectory.resolve(key);
            if (!Files.exists(filePath)) {
                logger.warn("File not found in local storage: {}", key);
                return null;
            }
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            logger.error("Failed to download file from local storage: {}", key, e);
            throw new RuntimeException("Failed to download file", e);
        }
    }
    
    @Override
    public void delete(String key) {
        try {
            Path filePath = storageDirectory.resolve(key);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.debug("File deleted from local storage: {}", key);
            }
        } catch (IOException e) {
            logger.error("Failed to delete file from local storage: {}", key, e);
            throw new RuntimeException("Failed to delete file", e);
        }
    }
    
    @Override
    public String getPublicUrl(String key) {
        Path filePath = storageDirectory.resolve(key);
        String absolutePath = filePath.toAbsolutePath().toString();
        // For local development we expose files directly from the filesystem.
        // Returning a file:// URL keeps the asset publicly accessible on the host machine.
        return "file://" + absolutePath.replace("\\", "/");
    }
    
    @Override
    public String generatePresignedUrl(String key, int expirationMinutes) {
        // For local file storage, just return the public URL
        // There's no concept of expiring URLs for local files
        return getPublicUrl(key);
    }
}

