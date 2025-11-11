package com.rapidphotoupload.infrastructure.persistence;

import com.rapidphotoupload.domain.aggregates.Photo;
import com.rapidphotoupload.domain.entities.PhotoMetadata;
import com.rapidphotoupload.domain.repositories.PhotoRepository;
import com.rapidphotoupload.domain.valueobjects.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Infrastructure implementation of PhotoRepository using JPA.
 */
@Component
public class JpaPhotoRepository implements PhotoRepository {
    
    private static final Logger logger = LoggerFactory.getLogger(JpaPhotoRepository.class);
    
    private final PhotoJpaRepository jpaRepository;
    
    public JpaPhotoRepository(PhotoJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }
    
    @Override
    public void save(Photo photo) {
        logger.debug("Saving photo: {}", photo.getId().getValue());
        PhotoEntity entity = toEntity(photo);
        jpaRepository.save(entity);
        logger.debug("Photo saved successfully: {}", photo.getId().getValue());
    }
    
    @Override
    public Optional<Photo> findById(PhotoId photoId) {
        logger.debug("Finding photo by ID: {}", photoId.getValue());
        return jpaRepository.findById(photoId.getValue())
            .map(this::toDomain);
    }
    
    @Override
    public List<Photo> findByUserId(UserId userId) {
        logger.debug("Finding photos by user ID: {}", userId.getValue());
        return jpaRepository.findByUserId(userId.getValue())
            .stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Photo> findByUserIdAndStatus(UserId userId, UploadStatus status) {
        logger.debug("Finding photos by user ID: {} and status: {}", userId.getValue(), status);
        return jpaRepository.findByUserIdAndStatus(userId.getValue(), status.name())
            .stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Photo> findByStatus(UploadStatus status) {
        logger.debug("Finding photos by status: {}", status);
        return jpaRepository.findByStatus(status.name())
            .stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }
    
    @Override
    public void delete(PhotoId photoId) {
        logger.debug("Deleting photo: {}", photoId.getValue());
        jpaRepository.deleteById(photoId.getValue());
        logger.debug("Photo deleted successfully: {}", photoId.getValue());
    }
    
    private PhotoEntity toEntity(Photo photo) {
        PhotoEntity entity = new PhotoEntity();
        entity.setId(photo.getId().getValue());
        entity.setUserId(photo.getUploadedBy().getUserId());
        entity.setFilename(photo.getFilename().getValue());
        entity.setFileSize(photo.getFileSize().getValue());
        entity.setContentType(photo.getContentType().getValue());
        entity.setStatus(photo.getStatus().name());
        if (photo.getStorageKey() != null) {
            entity.setStorageKey(photo.getStorageKey().getValue());
        }
        if (photo.getThumbnailStorageKey() != null) {
            entity.setThumbnailStorageKey(photo.getThumbnailStorageKey().getValue());
        }
        entity.setUploadedAt(photo.getUploadedAt().getValue());
        
        // Set metadata fields
        PhotoMetadata metadata = photo.getMetadata();
        if (metadata != null) {
            entity.setWidth(metadata.getWidth());
            entity.setHeight(metadata.getHeight());
            entity.setFileHash(metadata.getFileHash());
        }
        
        return entity;
    }
    
    private Photo toDomain(PhotoEntity entity) {
        // Reconstruct Photo aggregate from entity
        PhotoId photoId = PhotoId.from(entity.getId());
        Filename filename = Filename.from(entity.getFilename());
        FileSize fileSize = FileSize.from(entity.getFileSize());
        ContentType contentType = ContentType.from(entity.getContentType());
        UploadStatus status = UploadStatus.valueOf(entity.getStatus());
        StorageKey storageKey = entity.getStorageKey() != null 
            ? StorageKey.from(entity.getStorageKey()) 
            : null;
        StorageKey thumbnailStorageKey = entity.getThumbnailStorageKey() != null 
            ? StorageKey.from(entity.getThumbnailStorageKey()) 
            : null;
        UploadedAt uploadedAt = UploadedAt.from(entity.getUploadedAt());
        UploadedBy uploadedBy = UploadedBy.from(entity.getUserId());
        
        // Reconstruct metadata
        PhotoMetadata metadata = new PhotoMetadata();
        if (entity.getWidth() != null) {
            metadata.setWidth(entity.getWidth());
        }
        if (entity.getHeight() != null) {
            metadata.setHeight(entity.getHeight());
        }
        if (entity.getFileHash() != null) {
            metadata.setFileHash(entity.getFileHash());
        }
        
        return Photo.reconstruct(
            photoId,
            filename,
            fileSize,
            contentType,
            status,
            storageKey,
            thumbnailStorageKey,
            uploadedAt,
            uploadedBy,
            metadata
        );
    }
}

