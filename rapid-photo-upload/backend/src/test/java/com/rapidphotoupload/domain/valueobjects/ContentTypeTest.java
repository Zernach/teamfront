package com.rapidphotoupload.domain.valueobjects;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ContentTypeTest {

    @Test
    void shouldCreateContentTypeFromValidMimeType() {
        var contentType = ContentType.from("image/jpeg");
        
        assertNotNull(contentType);
        assertEquals("image/jpeg", contentType.getValue());
    }

    @Test
    void shouldNormalizeToLowercase() {
        var contentType = ContentType.from("IMAGE/JPEG");
        
        assertEquals("image/jpeg", contentType.getValue());
    }

    @Test
    void shouldThrowExceptionWhenInvalidMimeType() {
        assertThrows(IllegalArgumentException.class, () -> {
            ContentType.from("application/pdf");
        });
    }

    @Test
    void shouldThrowExceptionWhenNull() {
        assertThrows(IllegalArgumentException.class, () -> {
            ContentType.from(null);
        });
    }

    @Test
    void shouldAcceptValidImageTypes() {
        assertDoesNotThrow(() -> ContentType.from("image/png"));
        assertDoesNotThrow(() -> ContentType.from("image/gif"));
        assertDoesNotThrow(() -> ContentType.from("image/webp"));
    }
}

