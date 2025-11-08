package com.rapidphotoupload.infrastructure.exceptions;

/**
 * Exception thrown when validation fails.
 */
public class ValidationException extends DomainException {
    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
    }

    public ValidationException(String message, Throwable cause) {
        super("VALIDATION_ERROR", message, cause);
    }
}

