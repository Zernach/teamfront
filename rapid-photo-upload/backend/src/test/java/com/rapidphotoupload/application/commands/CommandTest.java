package com.rapidphotoupload.application.commands;

import com.rapidphotoupload.domain.valueobjects.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Set;

class CommandTest {

    @Test
    void shouldCreateUploadPhotoCommand() {
        var photoId = PhotoId.generate();
        var filename = Filename.from("test.jpg");
        var fileSize = FileSize.from(1024);
        var contentType = ContentType.from("image/jpeg");
        var userId = UserId.generate();
        var jobId = JobId.generate();

        var command = new UploadPhotoCommand(photoId, filename, fileSize, contentType, userId, jobId, Set.of("tag1"));

        assertNotNull(command);
        assertEquals(photoId, command.photoId());
        assertEquals(filename, command.filename());
        assertEquals(fileSize, command.fileSize());
        assertEquals(contentType, command.contentType());
        assertEquals(userId, command.userId());
        assertEquals(jobId, command.jobId());
    }
    
    @Test
    void shouldCreateUploadPhotoCommandWithNullPhotoId() {
        var filename = Filename.from("test.jpg");
        var fileSize = FileSize.from(1024);
        var contentType = ContentType.from("image/jpeg");
        var userId = UserId.generate();
        var jobId = JobId.generate();

        var command = new UploadPhotoCommand(null, filename, fileSize, contentType, userId, jobId, Set.of("tag1"));

        assertNotNull(command);
        assertNull(command.photoId());
        assertEquals(filename, command.filename());
        assertEquals(fileSize, command.fileSize());
        assertEquals(contentType, command.contentType());
        assertEquals(userId, command.userId());
        assertEquals(jobId, command.jobId());
    }

    @Test
    void shouldCreateRetryFailedUploadCommand() {
        var photoId = PhotoId.generate();
        var userId = UserId.generate();

        var command = new RetryFailedUploadCommand(photoId, userId);

        assertNotNull(command);
        assertEquals(photoId, command.photoId());
        assertEquals(userId, command.userId());
    }

    @Test
    void shouldCreateCreateUploadJobCommand() {
        var userId = UserId.generate();

        var command = new CreateUploadJobCommand(userId, 10);

        assertNotNull(command);
        assertEquals(userId, command.userId());
        assertEquals(10, command.totalPhotos());
    }

    @Test
    void shouldValidateCreateUploadJobCommand() {
        var userId = UserId.generate();

        assertThrows(IllegalArgumentException.class, () -> {
            new CreateUploadJobCommand(userId, 0);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            new CreateUploadJobCommand(userId, 101);
        });
    }
}

