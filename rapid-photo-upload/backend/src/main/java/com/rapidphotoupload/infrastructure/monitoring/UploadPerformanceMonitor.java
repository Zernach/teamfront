package com.rapidphotoupload.infrastructure.monitoring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Performance monitoring for photo uploads.
 * Tracks metrics to ensure compliance with performance requirements:
 * - 100 concurrent uploads must complete within 90 seconds
 * - UI must remain responsive (no blocking)
 */
@Component
public class UploadPerformanceMonitor {
    
    private static final Logger logger = LoggerFactory.getLogger(UploadPerformanceMonitor.class);
    
    // Track upload start times by photoId
    private final ConcurrentHashMap<String, Instant> uploadStartTimes = new ConcurrentHashMap<>();
    
    // Track job start times by jobId
    private final ConcurrentHashMap<String, Instant> jobStartTimes = new ConcurrentHashMap<>();
    
    // Metrics
    private final AtomicInteger activeUploads = new AtomicInteger(0);
    private final AtomicInteger completedUploads = new AtomicInteger(0);
    private final AtomicInteger failedUploads = new AtomicInteger(0);
    private final AtomicLong totalUploadTimeMs = new AtomicLong(0);
    
    /**
     * Record the start of a photo upload.
     */
    public void recordUploadStart(String photoId, String jobId) {
        Instant now = Instant.now();
        uploadStartTimes.put(photoId, now);
        activeUploads.incrementAndGet();
        
        // Record job start time if not already tracked
        if (jobId != null) {
            jobStartTimes.putIfAbsent(jobId, now);
        }
        
        logger.debug("Upload started - PhotoId: {}, JobId: {}, Active uploads: {}", 
            photoId, jobId, activeUploads.get());
    }
    
    /**
     * Record the completion of a photo upload.
     */
    public void recordUploadComplete(String photoId) {
        Instant startTime = uploadStartTimes.remove(photoId);
        if (startTime == null) {
            logger.warn("Upload completion recorded without start time: {}", photoId);
            return;
        }
        
        Duration duration = Duration.between(startTime, Instant.now());
        long durationMs = duration.toMillis();
        
        activeUploads.decrementAndGet();
        completedUploads.incrementAndGet();
        totalUploadTimeMs.addAndGet(durationMs);
        
        logger.info("Upload completed - PhotoId: {}, Duration: {}ms, Active: {}, Completed: {}", 
            photoId, durationMs, activeUploads.get(), completedUploads.get());
        
        // Alert if upload took longer than expected (>10 seconds for 2MB file)
        if (durationMs > 10_000) {
            logger.warn("SLOW UPLOAD DETECTED - PhotoId: {}, Duration: {}ms", photoId, durationMs);
        }
    }
    
    /**
     * Record the failure of a photo upload.
     */
    public void recordUploadFailed(String photoId, String errorMessage) {
        uploadStartTimes.remove(photoId);
        activeUploads.decrementAndGet();
        failedUploads.incrementAndGet();
        
        logger.error("Upload failed - PhotoId: {}, Error: {}, Active: {}, Failed: {}", 
            photoId, errorMessage, activeUploads.get(), failedUploads.get());
    }
    
    /**
     * Record the completion of an entire upload job.
     */
    public void recordJobComplete(String jobId, int totalPhotos) {
        Instant startTime = jobStartTimes.remove(jobId);
        if (startTime == null) {
            logger.warn("Job completion recorded without start time: {}", jobId);
            return;
        }
        
        Duration duration = Duration.between(startTime, Instant.now());
        long durationSeconds = duration.getSeconds();
        
        logger.info("Job completed - JobId: {}, Photos: {}, Duration: {}s", 
            jobId, totalPhotos, durationSeconds);
        
        // CRITICAL: Alert if job took longer than 90 seconds
        if (durationSeconds > 90) {
            logger.error("PERFORMANCE REQUIREMENT VIOLATED - JobId: {}, Duration: {}s (> 90s threshold)", 
                jobId, durationSeconds);
        } else if (totalPhotos >= 100) {
            logger.info("PERFORMANCE REQUIREMENT MET - 100 photos uploaded in {}s (< 90s threshold)", 
                durationSeconds);
        }
    }
    
    /**
     * Get current active upload count.
     */
    public int getActiveUploadCount() {
        return activeUploads.get();
    }
    
    /**
     * Get total completed upload count.
     */
    public int getCompletedUploadCount() {
        return completedUploads.get();
    }
    
    /**
     * Get total failed upload count.
     */
    public int getFailedUploadCount() {
        return failedUploads.get();
    }
    
    /**
     * Get average upload time in milliseconds.
     */
    public long getAverageUploadTimeMs() {
        int completed = completedUploads.get();
        if (completed == 0) return 0;
        return totalUploadTimeMs.get() / completed;
    }
    
    /**
     * Get upload success rate as percentage.
     */
    public double getSuccessRate() {
        int total = completedUploads.get() + failedUploads.get();
        if (total == 0) return 100.0;
        return (completedUploads.get() * 100.0) / total;
    }
    
    /**
     * Log current performance metrics.
     */
    public void logMetrics() {
        logger.info("=== UPLOAD PERFORMANCE METRICS ===");
        logger.info("Active uploads: {}", getActiveUploadCount());
        logger.info("Completed uploads: {}", getCompletedUploadCount());
        logger.info("Failed uploads: {}", getFailedUploadCount());
        logger.info("Average upload time: {}ms", getAverageUploadTimeMs());
        logger.info("Success rate: {:.2f}%", getSuccessRate());
        logger.info("==================================");
    }
    
    /**
     * Reset all metrics (useful for testing).
     */
    public void reset() {
        uploadStartTimes.clear();
        jobStartTimes.clear();
        activeUploads.set(0);
        completedUploads.set(0);
        failedUploads.set(0);
        totalUploadTimeMs.set(0);
        logger.info("Performance metrics reset");
    }
}

