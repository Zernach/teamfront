package com.rapidphotoupload.infrastructure.storage;

import com.rapidphotoupload.domain.valueobjects.PhotoId;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Temporary in-memory storage for files during upload processing.
 * Files are stored here until async processing completes.
 */
@Component
public class TemporaryFileStorage {
    
    private final Map<String, byte[]> fileStorage = new ConcurrentHashMap<>();
    
    /**
     * Store a file temporarily, keyed by PhotoId.
     * @param photoId Photo ID to use as key
     * @param file MultipartFile to store
     * @throws IOException if file cannot be read
     */
    public void store(PhotoId photoId, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }
        byte[] bytes = file.getBytes();
        fileStorage.put(photoId.getValue().toString(), bytes);
    }
    
    /**
     * Retrieve a stored file as InputStream.
     * @param photoId Photo ID key
     * @return InputStream of file bytes, or null if not found
     */
    public InputStream retrieve(PhotoId photoId) {
        byte[] bytes = fileStorage.get(photoId.getValue().toString());
        if (bytes == null) {
            return null;
        }
        return new ByteArrayInputStream(bytes);
    }
    
    /**
     * Remove a stored file.
     * @param photoId Photo ID key
     */
    public void remove(PhotoId photoId) {
        fileStorage.remove(photoId.getValue().toString());
    }
    
    /**
     * Check if a file exists.
     * @param photoId Photo ID key
     * @return true if file exists
     */
    public boolean exists(PhotoId photoId) {
        return fileStorage.containsKey(photoId.getValue().toString());
    }
}

