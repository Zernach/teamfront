package com.rapidphotoupload.domain.valueobjects;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PhotoIdTest {

    @Test
    void shouldCreatePhotoIdFromUuid() {
        var uuid = java.util.UUID.randomUUID();
        var photoId = PhotoId.from(uuid);
        
        assertNotNull(photoId);
        assertEquals(uuid, photoId.getValue());
    }

    @Test
    void shouldGenerateNewPhotoId() {
        var photoId = PhotoId.generate();
        
        assertNotNull(photoId);
        assertNotNull(photoId.getValue());
    }

    @Test
    void shouldThrowExceptionWhenUuidIsNull() {
        assertThrows(IllegalArgumentException.class, () -> {
            PhotoId.from(null);
        });
    }

    @Test
    void shouldBeEqualWhenSameUuid() {
        var uuid = java.util.UUID.randomUUID();
        var photoId1 = PhotoId.from(uuid);
        var photoId2 = PhotoId.from(uuid);
        
        assertEquals(photoId1, photoId2);
        assertEquals(photoId1.hashCode(), photoId2.hashCode());
    }
}

