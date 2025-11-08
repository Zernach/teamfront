package com.rapidphotoupload.domain.valueobjects;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UsernameTest {

    @Test
    void shouldCreateUsernameFromValidString() {
        var username = Username.from("john_doe");
        
        assertNotNull(username);
        assertEquals("john_doe", username.getValue());
    }

    @Test
    void shouldThrowExceptionWhenTooShort() {
        assertThrows(IllegalArgumentException.class, () -> {
            Username.from("ab");
        });
    }

    @Test
    void shouldThrowExceptionWhenTooLong() {
        var longName = "a".repeat(51);
        assertThrows(IllegalArgumentException.class, () -> {
            Username.from(longName);
        });
    }

    @Test
    void shouldThrowExceptionWhenInvalidCharacters() {
        assertThrows(IllegalArgumentException.class, () -> {
            Username.from("john-doe");
        });
    }

    @Test
    void shouldAcceptValidCharacters() {
        assertDoesNotThrow(() -> Username.from("john_doe123"));
        assertDoesNotThrow(() -> Username.from("user123"));
        assertDoesNotThrow(() -> Username.from("abc"));
    }
}

