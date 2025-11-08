package com.rapidphotoupload.domain.valueobjects;

/**
 * JobStatus enum representing the current state of an upload job.
 */
public enum JobStatus {
    CREATED,
    IN_PROGRESS,
    COMPLETED,
    PARTIALLY_FAILED,
    FAILED
}

