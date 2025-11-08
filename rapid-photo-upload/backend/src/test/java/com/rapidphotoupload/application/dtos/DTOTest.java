package com.rapidphotoupload.application.dtos;

import com.rapidphotoupload.domain.valueobjects.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.time.Instant;
import java.util.List;
import java.util.Set;

class DTOTest {

    @Test
    void shouldCreatePhotoDTO() {
        var photoId = PhotoId.generate();
        var instant = Instant.now();

        var dto = new PhotoDTO(
            photoId,
            "test.jpg",
            1024,
            "image/jpeg",
            UploadStatus.COMPLETED,
            "user123/photo.jpg",
            "user123/thumb.jpg",
            instant,
            "user-id-123",
            Set.of("tag1", "tag2"),
            1920,
            1080,
            "abc123"
        );

        assertNotNull(dto);
        assertEquals(photoId, dto.photoId());
        assertEquals("test.jpg", dto.filename());
        assertEquals(1024, dto.fileSize());
    }

    @Test
    void shouldCreateUploadJobDTO() {
        var jobId = JobId.generate();
        var createdAt = Instant.now();
        var completedAt = Instant.now();

        var dto = new UploadJobDTO(
            jobId,
            "user-id-123",
            List.of("photo1", "photo2"),
            10,
            5,
            1,
            JobStatus.IN_PROGRESS,
            50,
            createdAt,
            completedAt
        );

        assertNotNull(dto);
        assertEquals(jobId, dto.jobId());
        assertEquals(10, dto.totalPhotos());
        assertEquals(50, dto.progressPercentage());
    }

    @Test
    void shouldCreatePhotoListDTO() {
        var photoId = PhotoId.generate();
        var photoDTO = new PhotoDTO(
            photoId,
            "test.jpg",
            1024,
            "image/jpeg",
            UploadStatus.COMPLETED,
            "user123/photo.jpg",
            null,
            Instant.now(),
            "user-id-123",
            Set.of(),
            null,
            null,
            null
        );

        var listDTO = new PhotoListDTO(
            List.of(photoDTO),
            0,
            20,
            1,
            1,
            false,
            false
        );

        assertNotNull(listDTO);
        assertEquals(1, listDTO.photos().size());
        assertEquals(0, listDTO.page());
        assertEquals(20, listDTO.pageSize());
    }
}

