package com.rapidphotoupload.domain.aggregates;

import com.rapidphotoupload.domain.valueobjects.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UploadJobTest {

    @Test
    void shouldCreateUploadJob() {
        var jobId = JobId.generate();
        var userId = UserId.generate();
        
        var job = UploadJob.create(jobId, userId, 10);
        
        assertNotNull(job);
        assertEquals(jobId, job.getId());
        assertEquals(userId, job.getUserId());
        assertEquals(10, job.getTotalPhotos().getValue());
        assertEquals(0, job.getCompletedPhotos().getValue());
        assertEquals(0, job.getFailedPhotos().getValue());
        assertEquals(JobStatus.CREATED, job.getStatus());
        assertNotNull(job.getCreatedAt());
        
        // Check domain event was raised
        var events = job.getDomainEvents();
        assertEquals(1, events.size());
        assertTrue(events.get(0) instanceof com.rapidphotoupload.domain.events.UploadJobCreated);
    }

    @Test
    void shouldThrowExceptionWhenTotalPhotosExceeds100() {
        var jobId = JobId.generate();
        var userId = UserId.generate();
        
        assertThrows(IllegalArgumentException.class, () -> {
            UploadJob.create(jobId, userId, 101);
        });
    }

    @Test
    void shouldAddPhotoToJob() {
        var job = createTestJob();
        var photoId = PhotoId.generate();
        
        job.addPhoto(photoId);
        
        assertEquals(1, job.getPhotos().size());
        assertEquals(photoId, job.getPhotos().get(0));
        assertEquals(JobStatus.IN_PROGRESS, job.getStatus());
    }

    @Test
    void shouldMarkPhotoAsCompleted() {
        var job = createTestJob();
        var photoId = PhotoId.generate();
        job.addPhoto(photoId);
        job.getDomainEvents().clear();
        
        job.markPhotoCompleted(photoId);
        
        assertEquals(1, job.getCompletedPhotos().getValue());
        var events = job.getDomainEvents();
        assertEquals(1, events.size());
        assertTrue(events.get(0) instanceof com.rapidphotoupload.domain.events.UploadJobProgressed);
    }

    @Test
    void shouldMarkJobAsCompletedWhenAllPhotosCompleted() {
        var job = createTestJob();
        var photoId1 = PhotoId.generate();
        var photoId2 = PhotoId.generate();
        job.addPhoto(photoId1);
        job.addPhoto(photoId2);
        job.getDomainEvents().clear();
        
        job.markPhotoCompleted(photoId1);
        job.markPhotoCompleted(photoId2);
        
        assertEquals(JobStatus.COMPLETED, job.getStatus());
        assertNotNull(job.getCompletedAt());
        var events = job.getDomainEvents();
        assertTrue(events.stream().anyMatch(e -> e instanceof com.rapidphotoupload.domain.events.UploadJobCompleted));
    }

    @Test
    void shouldCalculateOverallProgress() {
        var job = createTestJob();
        var photoId1 = PhotoId.generate();
        var photoId2 = PhotoId.generate();
        job.addPhoto(photoId1);
        job.addPhoto(photoId2);
        
        job.markPhotoCompleted(photoId1);
        
        assertEquals(50, job.getOverallProgress());
    }

    private UploadJob createTestJob() {
        var jobId = JobId.generate();
        var userId = UserId.generate();
        return UploadJob.create(jobId, userId, 2);
    }
}

