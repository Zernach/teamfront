package com.rapidphotoupload.domain.valueobjects;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailTest {

    @Test
    void shouldCreateEmailFromValidString() {
        var email = Email.from("test@example.com");
        
        assertNotNull(email);
        assertEquals("test@example.com", email.getValue());
    }

    @Test
    void shouldNormalizeToLowercase() {
        var email = Email.from("TEST@EXAMPLE.COM");
        
        assertEquals("test@example.com", email.getValue());
    }

    @Test
    void shouldThrowExceptionWhenInvalidFormat() {
        assertThrows(IllegalArgumentException.class, () -> {
            Email.from("invalid-email");
        });
    }

    @Test
    void shouldThrowExceptionWhenNull() {
        assertThrows(IllegalArgumentException.class, () -> {
            Email.from(null);
        });
    }

    @Test
    void shouldAcceptValidEmails() {
        assertDoesNotThrow(() -> Email.from("user@example.com"));
        assertDoesNotThrow(() -> Email.from("test.user@example.co.uk"));
    }
}

