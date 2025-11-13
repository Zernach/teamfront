package com.rapidphotoupload.infrastructure.storage;

import com.rapidphotoupload.domain.aggregates.Photo;
import com.rapidphotoupload.domain.aggregates.UploadJob;
import com.rapidphotoupload.domain.events.PhotoUploadStarted;
import com.rapidphotoupload.domain.repositories.PhotoRepository;
import com.rapidphotoupload.domain.repositories.UploadJobRepository;
import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.StorageKey;
import com.rapidphotoupload.infrastructure.monitoring.UploadPerformanceMonitor;
import com.rapidphotoupload.infrastructure.websocket.ProgressWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.io.InputStream;

/**
 * Async processor for photo uploads.
 * Listens to PhotoUploadStarted events and processes file uploads to storage.
 */
@Component
public class PhotoUploadProcessor {
    
    private static final Logger logger = LoggerFactory.getLogger(PhotoUploadProcessor.class);
    
    private final TemporaryFileStorage temporaryFileStorage;
    private final CloudStorageService storageService;
    private final PhotoRepository photoRepository;
    private final UploadJobRepository uploadJobRepository;
    private final ProgressWebSocketHandler webSocketHandler;
    private final UploadPerformanceMonitor performanceMonitor;
    
    public PhotoUploadProcessor(
            TemporaryFileStorage temporaryFileStorage,
            CloudStorageService storageService,
            PhotoRepository photoRepository,
            UploadJobRepository uploadJobRepository,
            ProgressWebSocketHandler webSocketHandler,
            UploadPerformanceMonitor performanceMonitor) {
        this.temporaryFileStorage = temporaryFileStorage;
        this.storageService = storageService;
        this.photoRepository = photoRepository;
        this.uploadJobRepository = uploadJobRepository;
        this.webSocketHandler = webSocketHandler;
        this.performanceMonitor = performanceMonitor;
    }
    
    /**
     * Process photo upload asynchronously when PhotoUploadStarted event is fired.
     */
    @Async("taskExecutor")
    @EventListener
    public void handlePhotoUploadStarted(PhotoUploadStarted event) {
        PhotoId photoId = event.photoId();
        String photoIdString = photoId.getValue().toString();
        
        // Extract jobId from the event if available
        String jobIdString = event.jobId() != null ? event.jobId().getValue().toString() : null;
        
        // Record upload start for performance monitoring
        performanceMonitor.recordUploadStart(photoIdString, jobIdString);
        
        logger.info("Processing photo upload: {} (Job: {}), Active uploads: {}", 
            photoIdString, jobIdString, performanceMonitor.getActiveUploadCount());
        
        try {
            // Retrieve photo aggregate
            Photo photo = photoRepository.findById(photoId)
                    .orElseThrow(() -> new RuntimeException("Photo not found: " + photoId.getValue()));
            
            // Mark as uploading
            photo.markAsUploading();
            photoRepository.save(photo);
            
            // Send progress update: uploading started
            sendPhotoProgressUpdate(photo, 0, "UPLOADING", jobIdString);
            
            // Retrieve file from temporary storage
            InputStream fileStream = temporaryFileStorage.retrieve(photoId);
            if (fileStream == null) {
                logger.error("File not found in temporary storage for photo: {}", photoId.getValue());
                photo.markAsFailed("File not found in temporary storage");
                photoRepository.save(photo);
                performanceMonitor.recordUploadFailed(photoIdString, "File not found in temporary storage");
                sendPhotoProgressUpdate(photo, 0, "FAILED", jobIdString);
                updateJobProgress(jobIdString);
                return;
            }
            
            // Generate storage key
            String storageKey = generateStorageKey(photoId, photo.getFilename().getValue());
            
            // Upload to storage
            try {
                String uploadedKey = storageService.upload(
                    storageKey,
                    fileStream,
                    photo.getContentType().getValue()
                );
                
                // Mark as completed
                photo.markAsCompleted(StorageKey.from(uploadedKey));
                photoRepository.save(photo);
                
                // Clean up temporary storage
                temporaryFileStorage.remove(photoId);
                
                // Record completion for performance monitoring
                performanceMonitor.recordUploadComplete(photoIdString);
                
                // Send progress update: completed
                sendPhotoProgressUpdate(photo, 100, "COMPLETED", jobIdString);
                
                // Update job progress and check if job is complete
                updateJobProgress(jobIdString);
                
                logger.info("Photo upload completed successfully: {}", photoId.getValue());
                
            } catch (Exception e) {
                logger.error("Failed to upload photo to storage: {}", photoId.getValue(), e);
                photo.markAsFailed("Storage upload failed: " + e.getMessage());
                photoRepository.save(photo);
                temporaryFileStorage.remove(photoId);
                performanceMonitor.recordUploadFailed(photoIdString, e.getMessage());
                sendPhotoProgressUpdate(photo, 0, "FAILED", jobIdString);
                updateJobProgress(jobIdString);
            }
            
        } catch (Exception e) {
            logger.error("Error processing photo upload: {}", photoId.getValue(), e);
            // Try to mark photo as failed if we can retrieve it
            try {
                Photo photo = photoRepository.findById(photoId).orElse(null);
                if (photo != null) {
                    photo.markAsFailed("Processing failed: " + e.getMessage());
                    photoRepository.save(photo);
                }
            } catch (Exception ex) {
                logger.error("Failed to mark photo as failed: {}", photoId.getValue(), ex);
            }
            temporaryFileStorage.remove(photoId);
        }
    }
    
    /**
     * Send progress update for a photo via WebSocket.
     */
    private void sendPhotoProgressUpdate(Photo photo, int percentage, String status, String jobId) {
        try {
            String userId = photo.getUploadedBy().getUserId().toString();
            
            ProgressWebSocketHandler.ProgressMessage message = new ProgressWebSocketHandler.ProgressMessage(
                "photo_progress",
                photo.getId().getValue().toString(),
                jobId,
                percentage,
                100,
                status
            );
            webSocketHandler.sendProgressUpdate(userId, message);
            logger.debug("Sent progress update for photo {}: {}% - {} (jobId: {})", 
                photo.getId().getValue(), percentage, status, jobId);
        } catch (Exception e) {
            logger.error("Failed to send progress update for photo: {}", photo.getId().getValue(), e);
        }
    }
    
    /**
     * Update job progress after photo completion/failure.
     * Find the job this photo belongs to and update its progress.
     * If job is complete, record performance metrics.
     */
    private void updateJobProgress(String jobIdString) {
        try {
            if (jobIdString == null) {
                logger.debug("No jobId provided, skipping job progress update");
                return;
            }
            
            // Find the job and send progress update
            uploadJobRepository.findById(com.rapidphotoupload.domain.valueobjects.JobId.from(java.util.UUID.fromString(jobIdString)))
                .ifPresent(job -> {
                    String userId = job.getUserId().getValue().toString();
                    int completedPhotos = job.getCompletedPhotos().getValue();
                    int failedPhotos = job.getFailedPhotos().getValue();
                    int totalPhotos = job.getTotalPhotos().getValue();
                    
                    ProgressWebSocketHandler.ProgressMessage message = new ProgressWebSocketHandler.ProgressMessage(
                        "job_progress",
                        null,
                        jobIdString,
                        completedPhotos,
                        totalPhotos,
                        job.getStatus().name()
                    );
                    webSocketHandler.sendProgressUpdate(userId, message);
                    logger.debug("Sent job progress update: {}/{} photos completed for job {}", 
                        completedPhotos, totalPhotos, jobIdString);
                    
                    // Check if job is complete and record metrics
                    if (job.isComplete()) {
                        performanceMonitor.recordJobComplete(jobIdString, totalPhotos);
                        logger.info("Job {} complete: {} completed, {} failed, {} total", 
                            jobIdString, completedPhotos, failedPhotos, totalPhotos);
                    }
                });
        } catch (Exception e) {
            logger.error("Failed to update job progress for jobId {}: {}", jobIdString, e.getMessage(), e);
        }
    }
    
    /**
     * Generate storage key for photo.
     * Format: photos/{userId}/{photoId}/{filename}
     */
    private String generateStorageKey(PhotoId photoId, String filename) {
        // Extract extension from filename
        String extension = "";
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
            extension = filename.substring(lastDot);
        }
        
        // Use photoId as the base filename to avoid collisions
        return String.format("photos/%s/%s%s", 
            photoId.getValue().toString().substring(0, 2), // First 2 chars for partitioning
            photoId.getValue(),
            extension);
    }
}

