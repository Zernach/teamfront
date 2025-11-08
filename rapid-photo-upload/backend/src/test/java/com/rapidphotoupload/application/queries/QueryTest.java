package com.rapidphotoupload.application.queries;

import com.rapidphotoupload.domain.valueobjects.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class QueryTest {

    @Test
    void shouldCreateGetPhotoMetadataQuery() {
        var photoId = PhotoId.generate();
        var userId = UserId.generate();

        var query = new GetPhotoMetadataQuery(photoId, userId);

        assertNotNull(query);
        assertEquals(photoId, query.photoId());
        assertEquals(userId, query.userId());
    }

    @Test
    void shouldCreateGetUploadJobStatusQuery() {
        var jobId = JobId.generate();
        var userId = UserId.generate();

        var query = new GetUploadJobStatusQuery(jobId, userId);

        assertNotNull(query);
        assertEquals(jobId, query.jobId());
        assertEquals(userId, query.userId());
    }

    @Test
    void shouldCreateListUserPhotosQuery() {
        var userId = UserId.generate();

        var query = new ListUserPhotosQuery(userId, 0, 20);

        assertNotNull(query);
        assertEquals(userId, query.userId());
        assertEquals(0, query.page());
        assertEquals(20, query.pageSize());
        assertEquals("uploadedAt", query.sortBy());
        assertEquals("desc", query.sortOrder());
    }

    @Test
    void shouldValidateListUserPhotosQuery() {
        var userId = UserId.generate();

        assertThrows(IllegalArgumentException.class, () -> {
            new ListUserPhotosQuery(userId, -1, 20);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            new ListUserPhotosQuery(userId, 0, 0);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            new ListUserPhotosQuery(userId, 0, 101);
        });
    }
}

