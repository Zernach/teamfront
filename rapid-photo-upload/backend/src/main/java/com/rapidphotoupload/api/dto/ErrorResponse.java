package com.rapidphotoupload.api.dto;

import java.time.Instant;

/**
 * Error response DTO for API error responses.
 */
public record ErrorResponse(
    String errorCode,
    String message,
    Instant timestamp,
    String path
) {
    public ErrorResponse(String errorCode, String message, String path) {
        this(errorCode, message, Instant.now(), path);
    }
}

