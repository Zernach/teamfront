package com.rapidphotoupload.domain.valueobjects;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FileSizeTest {

    @Test
    void shouldCreateFileSizeFromValidBytes() {
        var fileSize = FileSize.from(1024);
        
        assertNotNull(fileSize);
        assertEquals(1024, fileSize.getValue());
    }

    @Test
    void shouldThrowExceptionWhenZero() {
        assertThrows(IllegalArgumentException.class, () -> {
            FileSize.from(0);
        });
    }

    @Test
    void shouldThrowExceptionWhenNegative() {
        assertThrows(IllegalArgumentException.class, () -> {
            FileSize.from(-1);
        });
    }

    @Test
    void shouldCalculateKilobytes() {
        var fileSize = FileSize.from(2048);
        
        assertEquals(2.0, fileSize.getKilobytes(), 0.01);
    }

    @Test
    void shouldCalculateMegabytes() {
        var fileSize = FileSize.from(2097152); // 2MB
        
        assertEquals(2.0, fileSize.getMegabytes(), 0.01);
    }
}

