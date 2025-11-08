package com.rapidphotoupload.domain.aggregates;

import com.rapidphotoupload.domain.valueobjects.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PhotoTest {

    @Test
    void shouldCreatePhotoWithRequiredFields() {
        var photoId = PhotoId.generate();
        var filename = Filename.from("test.jpg");
        var fileSize = FileSize.from(1024);
        var contentType = ContentType.from("image/jpeg");
        var userId = UserId.generate();
        var uploadedBy = UploadedBy.from(userId.getValue());

        var photo = Photo.create(photoId, filename, fileSize, contentType, uploadedBy);

        assertNotNull(photo);
        assertEquals(photoId, photo.getId());
        assertEquals(filename, photo.getFilename());
        assertEquals(fileSize, photo.getFileSize());
        assertEquals(contentType, photo.getContentType());
        assertEquals(UploadStatus.QUEUED, photo.getStatus());
        assertEquals(uploadedBy, photo.getUploadedBy());
        assertNotNull(photo.getUploadedAt());
        assertNotNull(photo.getMetadata());
        
        // Check domain event was raised
        var events = photo.getDomainEvents();
        assertEquals(1, events.size());
        assertTrue(events.get(0) instanceof com.rapidphotoupload.domain.events.PhotoUploadStarted);
    }

    @Test
    void shouldMarkPhotoAsUploading() {
        var photo = createTestPhoto();
        photo.getDomainEvents().clear(); // Clear the PhotoUploadStarted event
        
        photo.markAsUploading();
        
        assertEquals(UploadStatus.UPLOADING, photo.getStatus());
        var events = photo.getDomainEvents();
        assertEquals(1, events.size());
        assertTrue(events.get(0) instanceof com.rapidphotoupload.domain.events.PhotoUploadProgressed);
    }

    @Test
    void shouldUpdateProgress() {
        var photo = createTestPhoto();
        photo.markAsUploading();
        photo.getDomainEvents().clear();
        
        photo.updateProgress(50);
        
        var events = photo.getDomainEvents();
        assertEquals(1, events.size());
        var progressEvent = (com.rapidphotoupload.domain.events.PhotoUploadProgressed) events.get(0);
        assertEquals(50, progressEvent.progressPercentage());
    }

    @Test
    void shouldMarkPhotoAsCompleted() {
        var photo = createTestPhoto();
        photo.markAsUploading();
        photo.getDomainEvents().clear();
        var storageKey = StorageKey.from("user123/photo456.jpg");
        
        photo.markAsCompleted(storageKey);
        
        assertEquals(UploadStatus.COMPLETED, photo.getStatus());
        assertEquals(storageKey, photo.getStorageKey());
        var events = photo.getDomainEvents();
        assertEquals(1, events.size());
        assertTrue(events.get(0) instanceof com.rapidphotoupload.domain.events.PhotoUploadCompleted);
    }

    @Test
    void shouldMarkPhotoAsFailed() {
        var photo = createTestPhoto();
        photo.markAsUploading();
        photo.getDomainEvents().clear();
        
        photo.markAsFailed("Network error");
        
        assertEquals(UploadStatus.FAILED, photo.getStatus());
        var events = photo.getDomainEvents();
        assertEquals(1, events.size());
        assertTrue(events.get(0) instanceof com.rapidphotoupload.domain.events.PhotoUploadFailed);
    }

    @Test
    void shouldCancelPhoto() {
        var photo = createTestPhoto();
        
        photo.cancel();
        
        assertEquals(UploadStatus.CANCELLED, photo.getStatus());
    }

    @Test
    void shouldThrowExceptionWhenMarkingCompletedFromWrongStatus() {
        var photo = createTestPhoto();
        
        assertThrows(IllegalStateException.class, () -> {
            photo.markAsCompleted(StorageKey.from("test.jpg"));
        });
    }

    private Photo createTestPhoto() {
        var photoId = PhotoId.generate();
        var filename = Filename.from("test.jpg");
        var fileSize = FileSize.from(1024);
        var contentType = ContentType.from("image/jpeg");
        var userId = UserId.generate();
        var uploadedBy = UploadedBy.from(userId.getValue());
        return Photo.create(photoId, filename, fileSize, contentType, uploadedBy);
    }
}

