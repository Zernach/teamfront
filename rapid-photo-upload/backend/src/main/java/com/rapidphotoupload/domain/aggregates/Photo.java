package com.rapidphotoupload.domain.aggregates;

import com.rapidphotoupload.domain.entities.PhotoMetadata;
import com.rapidphotoupload.domain.events.PhotoUploadCompleted;
import com.rapidphotoupload.domain.events.PhotoUploadFailed;
import com.rapidphotoupload.domain.events.PhotoUploadProgressed;
import com.rapidphotoupload.domain.events.PhotoUploadStarted;
import com.rapidphotoupload.domain.valueobjects.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Photo aggregate root.
 * Maintains consistency boundaries and enforces business invariants.
 */
public class Photo {
    private PhotoId id;
    private Filename filename;
    private FileSize fileSize;
    private ContentType contentType;
    private UploadStatus status;
    private StorageKey storageKey;
    private StorageKey thumbnailStorageKey;
    private UploadedAt uploadedAt;
    private UploadedBy uploadedBy;
    private PhotoMetadata metadata;
    private List<Object> domainEvents;

    // Private constructor for aggregate creation
    private Photo() {
        this.domainEvents = new ArrayList<>();
    }

    /**
     * Factory method to reconstruct a Photo aggregate from persistence (for repository use).
     * This is used by infrastructure layer to reconstruct aggregates from database entities.
     */
    public static Photo reconstruct(
        PhotoId id,
        Filename filename,
        FileSize fileSize,
        ContentType contentType,
        UploadStatus status,
        StorageKey storageKey,
        StorageKey thumbnailStorageKey,
        UploadedAt uploadedAt,
        UploadedBy uploadedBy,
        PhotoMetadata metadata
    ) {
        Photo photo = new Photo();
        photo.id = id;
        photo.filename = filename;
        photo.fileSize = fileSize;
        photo.contentType = contentType;
        photo.status = status;
        photo.storageKey = storageKey;
        photo.thumbnailStorageKey = thumbnailStorageKey;
        photo.uploadedAt = uploadedAt;
        photo.uploadedBy = uploadedBy;
        photo.metadata = metadata != null ? metadata : new PhotoMetadata();
        // Don't raise domain events when reconstructing from persistence
        return photo;
    }

    /**
     * Factory method to create a new Photo aggregate.
     */
    public static Photo create(
        PhotoId id,
        Filename filename,
        FileSize fileSize,
        ContentType contentType,
        UploadedBy uploadedBy
    ) {
        return create(id, filename, fileSize, contentType, uploadedBy, null);
    }
    
    public static Photo create(
        PhotoId id,
        Filename filename,
        FileSize fileSize,
        ContentType contentType,
        UploadedBy uploadedBy,
        com.rapidphotoupload.domain.valueobjects.JobId jobId
    ) {
        Photo photo = new Photo();
        photo.id = id;
        photo.filename = filename;
        photo.fileSize = fileSize;
        photo.contentType = contentType;
        photo.status = UploadStatus.QUEUED;
        photo.uploadedBy = uploadedBy;
        photo.uploadedAt = UploadedAt.now();
        photo.metadata = new PhotoMetadata();

        // Raise domain event with jobId
        photo.raiseEvent(PhotoUploadStarted.create(id, uploadedBy, jobId));

        return photo;
    }

    /**
     * Mark photo upload as started.
     */
    public void markAsUploading() {
        if (this.status != UploadStatus.QUEUED) {
            throw new IllegalStateException("Photo can only be marked as uploading from QUEUED status");
        }
        this.status = UploadStatus.UPLOADING;
        raiseEvent(PhotoUploadProgressed.create(this.id, 0));
    }

    /**
     * Update upload progress.
     */
    public void updateProgress(int percentage) {
        if (this.status != UploadStatus.UPLOADING) {
            throw new IllegalStateException("Can only update progress for photos in UPLOADING status");
        }
        if (percentage < 0 || percentage > 100) {
            throw new IllegalArgumentException("Progress percentage must be between 0 and 100");
        }
        raiseEvent(PhotoUploadProgressed.create(this.id, percentage));
    }

    /**
     * Mark photo upload as completed.
     */
    public void markAsCompleted(StorageKey storageKey) {
        if (this.status != UploadStatus.UPLOADING) {
            throw new IllegalStateException("Photo can only be marked as completed from UPLOADING status");
        }
        if (storageKey == null) {
            throw new IllegalArgumentException("StorageKey cannot be null");
        }
        this.status = UploadStatus.COMPLETED;
        this.storageKey = storageKey;
        this.uploadedAt = UploadedAt.now();
        raiseEvent(PhotoUploadCompleted.create(this.id, storageKey));
    }

    /**
     * Mark photo upload as failed.
     */
    public void markAsFailed(String errorMessage) {
        if (this.status == UploadStatus.COMPLETED || this.status == UploadStatus.CANCELLED) {
            throw new IllegalStateException("Cannot mark completed or cancelled photo as failed");
        }
        this.status = UploadStatus.FAILED;
        raiseEvent(PhotoUploadFailed.create(this.id, errorMessage));
    }

    /**
     * Cancel photo upload.
     */
    public void cancel() {
        if (this.status == UploadStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel completed photo");
        }
        this.status = UploadStatus.CANCELLED;
    }

    /**
     * Set thumbnail storage key.
     */
    public void setThumbnailStorageKey(StorageKey thumbnailStorageKey) {
        this.thumbnailStorageKey = thumbnailStorageKey;
    }

    /**
     * Update metadata.
     */
    public void updateMetadata(PhotoMetadata metadata) {
        if (metadata == null) {
            throw new IllegalArgumentException("Metadata cannot be null");
        }
        this.metadata = metadata;
    }

    /**
     * Reset photo for retry (from FAILED to QUEUED).
     * Used by RetryFailedUploadCommand.
     */
    public void resetForRetry() {
        if (this.status != UploadStatus.FAILED) {
            throw new IllegalStateException("Can only retry photos with FAILED status");
        }
        this.status = UploadStatus.QUEUED;
        // Raise PhotoUploadStarted event to trigger async processing
        raiseEvent(PhotoUploadStarted.create(this.id, this.uploadedBy, null));
    }

    /**
     * Check if photo can be deleted.
     * Photos in UPLOADING status should not be deleted.
     */
    public boolean canDelete() {
        return this.status != UploadStatus.UPLOADING;
    }

    /**
     * Validate business invariants.
     * Throws IllegalStateException if invariants are violated.
     */
    public void validateInvariants() {
        if (this.status == UploadStatus.COMPLETED && this.storageKey == null) {
            throw new IllegalStateException("COMPLETED photos must have a storage key");
        }
        if (this.fileSize.getValue() <= 0) {
            throw new IllegalStateException("File size must be greater than 0");
        }
        if (this.status == UploadStatus.UPLOADING && this.storageKey != null) {
            throw new IllegalStateException("UPLOADING photos should not have a storage key yet");
        }
    }

    // Getters
    public PhotoId getId() {
        return id;
    }

    public Filename getFilename() {
        return filename;
    }

    public FileSize getFileSize() {
        return fileSize;
    }

    public ContentType getContentType() {
        return contentType;
    }

    public UploadStatus getStatus() {
        return status;
    }

    public StorageKey getStorageKey() {
        return storageKey;
    }

    public StorageKey getThumbnailStorageKey() {
        return thumbnailStorageKey;
    }

    public UploadedAt getUploadedAt() {
        return uploadedAt;
    }

    public UploadedBy getUploadedBy() {
        return uploadedBy;
    }

    public PhotoMetadata getMetadata() {
        return metadata;
    }

    /**
     * Get and clear domain events (for event publishing).
     */
    public List<Object> getDomainEvents() {
        List<Object> events = new ArrayList<>(this.domainEvents);
        this.domainEvents.clear();
        return events;
    }

    private void raiseEvent(Object event) {
        this.domainEvents.add(event);
    }
}

