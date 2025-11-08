package com.rapidphotoupload.infrastructure.exceptions;

/**
 * Exception thrown when a resource is not found.
 */
public class ResourceNotFoundException extends DomainException {
    public ResourceNotFoundException(String resourceType, String identifier) {
        super("RESOURCE_NOT_FOUND", String.format("%s with identifier %s not found", resourceType, identifier));
    }
}

