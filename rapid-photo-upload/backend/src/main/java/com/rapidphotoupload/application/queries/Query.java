package com.rapidphotoupload.application.queries;

/**
 * Base interface for all queries in the CQRS architecture.
 * Queries represent intent to read system state without modifying it.
 */
public interface Query<T> {
    // Marker interface for type safety
}

