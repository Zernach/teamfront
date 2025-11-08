package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;
import java.util.UUID;

/**
 * JobId value object representing a unique identifier for an UploadJob aggregate.
 */
public final class JobId {
    private final UUID value;

    private JobId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("JobId cannot be null");
        }
        this.value = value;
    }

    public static JobId from(UUID uuid) {
        return new JobId(uuid);
    }

    public static JobId generate() {
        return new JobId(UUID.randomUUID());
    }

    public UUID getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        JobId jobId = (JobId) o;
        return Objects.equals(value, jobId.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value.toString();
    }
}

