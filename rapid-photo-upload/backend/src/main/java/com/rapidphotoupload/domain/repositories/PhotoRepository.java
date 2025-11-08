package com.rapidphotoupload.domain.repositories;

import com.rapidphotoupload.domain.aggregates.Photo;
import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.UploadStatus;
import com.rapidphotoupload.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Photo aggregate.
 * This is a domain contract, implementation will be in infrastructure layer.
 */
public interface PhotoRepository {
    /**
     * Save a photo aggregate.
     */
    void save(Photo photo);

    /**
     * Find photo by ID.
     */
    Optional<Photo> findById(PhotoId photoId);

    /**
     * Find all photos for a user.
     */
    List<Photo> findByUserId(UserId userId);

    /**
     * Find photos by user and status.
     */
    List<Photo> findByUserIdAndStatus(UserId userId, UploadStatus status);

    /**
     * Find photos by status.
     */
    List<Photo> findByStatus(UploadStatus status);

    /**
     * Delete a photo.
     */
    void delete(PhotoId photoId);
}

