package com.rapidphotoupload.infrastructure.persistence;

import com.rapidphotoupload.domain.aggregates.Photo;
import com.rapidphotoupload.domain.repositories.PhotoRepository;
import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.UploadStatus;
import com.rapidphotoupload.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

/**
 * Infrastructure implementation of PhotoRepository.
 * This will use JPA/Hibernate to persist Photo aggregates.
 * Implementation will be completed in Epic 1, Story 1-5.
 */
public class JpaPhotoRepository implements PhotoRepository {
    // TODO: Implement JPA repository in Epic 1, Story 1-5
    // This will use Spring Data JPA or custom JPA implementation

    @Override
    public void save(Photo photo) {
        throw new UnsupportedOperationException("JpaPhotoRepository not yet implemented");
    }

    @Override
    public Optional<Photo> findById(PhotoId photoId) {
        throw new UnsupportedOperationException("JpaPhotoRepository not yet implemented");
    }

    @Override
    public List<Photo> findByUserId(UserId userId) {
        throw new UnsupportedOperationException("JpaPhotoRepository not yet implemented");
    }

    @Override
    public List<Photo> findByUserIdAndStatus(UserId userId, UploadStatus status) {
        throw new UnsupportedOperationException("JpaPhotoRepository not yet implemented");
    }

    @Override
    public List<Photo> findByStatus(UploadStatus status) {
        throw new UnsupportedOperationException("JpaPhotoRepository not yet implemented");
    }

    @Override
    public void delete(PhotoId photoId) {
        throw new UnsupportedOperationException("JpaPhotoRepository not yet implemented");
    }
}

