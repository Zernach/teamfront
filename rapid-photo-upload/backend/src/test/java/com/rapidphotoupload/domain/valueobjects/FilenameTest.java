package com.rapidphotoupload.domain.valueobjects;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FilenameTest {

    @Test
    void shouldCreateFilenameFromValidString() {
        var filename = Filename.from("test.jpg");
        
        assertNotNull(filename);
        assertEquals("test.jpg", filename.getValue());
    }

    @Test
    void shouldTrimWhitespace() {
        var filename = Filename.from("  test.jpg  ");
        
        assertEquals("test.jpg", filename.getValue());
    }

    @Test
    void shouldThrowExceptionWhenNull() {
        assertThrows(IllegalArgumentException.class, () -> {
            Filename.from(null);
        });
    }

    @Test
    void shouldThrowExceptionWhenEmpty() {
        assertThrows(IllegalArgumentException.class, () -> {
            Filename.from("");
        });
    }

    @Test
    void shouldThrowExceptionWhenTooLong() {
        var longName = "a".repeat(256);
        assertThrows(IllegalArgumentException.class, () -> {
            Filename.from(longName);
        });
    }
}

