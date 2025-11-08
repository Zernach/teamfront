package com.rapidphotoupload.domain.valueobjects;

import java.time.Instant;
import java.util.Objects;

/**
 * UploadedAt value object representing ISO 8601 timestamp.
 */
public final class UploadedAt {
    private final Instant value;

    private UploadedAt(Instant value) {
        if (value == null) {
            throw new IllegalArgumentException("UploadedAt cannot be null");
        }
        this.value = value;
    }

    public static UploadedAt from(Instant instant) {
        return new UploadedAt(instant);
    }

    public static UploadedAt now() {
        return new UploadedAt(Instant.now());
    }

    public Instant getValue() {
        return value;
    }

    public String toIso8601() {
        return value.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UploadedAt that = (UploadedAt) o;
        return Objects.equals(value, that.value);
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

