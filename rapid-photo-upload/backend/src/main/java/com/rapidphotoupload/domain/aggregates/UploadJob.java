package com.rapidphotoupload.domain.aggregates;

import com.rapidphotoupload.domain.events.UploadJobCompleted;
import com.rapidphotoupload.domain.events.UploadJobCreated;
import com.rapidphotoupload.domain.events.UploadJobFailed;
import com.rapidphotoupload.domain.events.UploadJobProgressed;
import com.rapidphotoupload.domain.valueobjects.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

/**
 * UploadJob aggregate root.
 * Tracks batch upload progress and maintains consistency boundaries.
 */
public class UploadJob {
    private JobId id;
    private UserId userId;
    private List<PhotoId> photos;
    private TotalPhotos totalPhotos;
    private CompletedPhotos completedPhotos;
    private FailedPhotos failedPhotos;
    private JobStatus status;
    private CreatedAt createdAt;
    private CompletedAt completedAt;
    private List<Object> domainEvents;

    // Private constructor for aggregate creation
    private UploadJob() {
        this.domainEvents = new ArrayList<>();
        this.photos = new ArrayList<>();
    }

    /**
     * Factory method to create a new UploadJob aggregate.
     */
    public static UploadJob create(JobId id, UserId userId, int totalPhotos) {
        if (totalPhotos <= 0) {
            throw new IllegalArgumentException("TotalPhotos must be greater than 0");
        }
        if (totalPhotos > 100) {
            throw new IllegalArgumentException("TotalPhotos cannot exceed 100");
        }

        UploadJob job = new UploadJob();
        job.id = id;
        job.userId = userId;
        job.totalPhotos = TotalPhotos.from(totalPhotos);
        job.completedPhotos = CompletedPhotos.zero();
        job.failedPhotos = FailedPhotos.zero();
        job.status = JobStatus.CREATED;
        job.createdAt = CreatedAt.now();

        // Raise domain event
        job.raiseEvent(UploadJobCreated.create(id, userId, totalPhotos));

        return job;
    }

    /**
     * Add a photo to the job.
     */
    public void addPhoto(PhotoId photoId) {
        if (photoId == null) {
            throw new IllegalArgumentException("PhotoId cannot be null");
        }
        if (this.photos.size() >= this.totalPhotos.getValue()) {
            throw new IllegalStateException("Cannot add more photos than totalPhotos");
        }
        if (this.photos.contains(photoId)) {
            throw new IllegalArgumentException("Photo already exists in job");
        }
        this.photos.add(photoId);
        if (this.status == JobStatus.CREATED && !this.photos.isEmpty()) {
            this.status = JobStatus.IN_PROGRESS;
        }
    }

    /**
     * Mark a photo as completed.
     */
    public void markPhotoCompleted(PhotoId photoId) {
        if (!this.photos.contains(photoId)) {
            throw new IllegalArgumentException("Photo not found in job");
        }
        this.completedPhotos = this.completedPhotos.increment();
        updateProgress();
        checkCompletion();
    }

    /**
     * Mark a photo as failed.
     */
    public void markPhotoFailed(PhotoId photoId) {
        if (!this.photos.contains(photoId)) {
            throw new IllegalArgumentException("Photo not found in job");
        }
        this.failedPhotos = this.failedPhotos.increment();
        updateProgress();
        checkCompletion();
    }

    /**
     * Mark job as failed.
     */
    public void markAsFailed(String errorMessage) {
        if (this.status == JobStatus.COMPLETED) {
            throw new IllegalStateException("Cannot mark completed job as failed");
        }
        this.status = JobStatus.FAILED;
        this.completedAt = CompletedAt.now();
        raiseEvent(UploadJobFailed.create(this.id, errorMessage));
    }

    private void updateProgress() {
        int completed = this.completedPhotos.getValue();
        int total = this.totalPhotos.getValue();
        raiseEvent(UploadJobProgressed.create(this.id, completed, total));
    }

    private void checkCompletion() {
        int completed = this.completedPhotos.getValue();
        int failed = this.failedPhotos.getValue();
        int total = this.totalPhotos.getValue();

        if (completed + failed >= total) {
            if (failed == 0) {
                this.status = JobStatus.COMPLETED;
                this.completedAt = CompletedAt.now();
                raiseEvent(UploadJobCompleted.create(this.id, total));
            } else if (completed > 0) {
                this.status = JobStatus.PARTIALLY_FAILED;
                this.completedAt = CompletedAt.now();
            } else {
                this.status = JobStatus.FAILED;
                this.completedAt = CompletedAt.now();
            }
        }
    }

    /**
     * Calculate overall progress percentage.
     */
    public int getOverallProgress() {
        int completed = this.completedPhotos.getValue();
        int total = this.totalPhotos.getValue();
        if (total == 0) return 0;
        return (int) Math.round((completed * 100.0) / total);
    }

    // Getters
    public JobId getId() {
        return id;
    }

    public UserId getUserId() {
        return userId;
    }

    public List<PhotoId> getPhotos() {
        return Collections.unmodifiableList(photos);
    }

    public TotalPhotos getTotalPhotos() {
        return totalPhotos;
    }

    public CompletedPhotos getCompletedPhotos() {
        return completedPhotos;
    }

    public FailedPhotos getFailedPhotos() {
        return failedPhotos;
    }

    public JobStatus getStatus() {
        return status;
    }

    public CreatedAt getCreatedAt() {
        return createdAt;
    }

    public CompletedAt getCompletedAt() {
        return completedAt;
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

