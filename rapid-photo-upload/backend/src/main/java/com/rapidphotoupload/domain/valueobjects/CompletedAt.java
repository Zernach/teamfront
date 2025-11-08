package com.rapidphotoupload.domain.valueobjects;

import java.time.Instant;
import java.util.Objects;

/**
 * CompletedAt value object representing completion timestamp.
 * Can be null if the job has not been completed.
 */
public final class CompletedAt {
    private final Instant value;

    private CompletedAt(Instant value) {
        // Allow null for jobs that haven't completed
        this.value = value;
    }

    public static CompletedAt from(Instant instant) {
        return new CompletedAt(instant);
    }

    public static CompletedAt now() {
        return new CompletedAt(Instant.now());
    }

    public static CompletedAt empty() {
        return new CompletedAt(null);
    }

    public Instant getValue() {
        return value;
    }

    public boolean isCompleted() {
        return value != null;
    }

    public String toIso8601() {
        return value != null ? value.toString() : null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CompletedAt that = (CompletedAt) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value != null ? value.toString() : "not completed";
    }
}

