package com.rapidphotoupload.infrastructure.persistence;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA entity for UploadJob aggregate.
 * Maps to the upload_jobs table in the database.
 */
@Entity
@Table(name = "upload_jobs")
public class UploadJobEntity {
    @Id
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;

    @Column(name = "total_photos", nullable = false)
    private Integer totalPhotos;

    @Column(name = "completed_photos", nullable = false)
    private Integer completedPhotos;

    @Column(name = "failed_photos", nullable = false)
    private Integer failedPhotos;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    // Default constructor for JPA
    public UploadJobEntity() {
    }

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Integer getTotalPhotos() {
        return totalPhotos;
    }

    public void setTotalPhotos(Integer totalPhotos) {
        this.totalPhotos = totalPhotos;
    }

    public Integer getCompletedPhotos() {
        return completedPhotos;
    }

    public void setCompletedPhotos(Integer completedPhotos) {
        this.completedPhotos = completedPhotos;
    }

    public Integer getFailedPhotos() {
        return failedPhotos;
    }

    public void setFailedPhotos(Integer failedPhotos) {
        this.failedPhotos = failedPhotos;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}

