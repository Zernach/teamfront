package com.rapidphotoupload.domain.valueobjects;

import java.time.Instant;
import java.util.Objects;

/**
 * CreatedAt value object representing creation timestamp.
 */
public final class CreatedAt {
    private final Instant value;

    private CreatedAt(Instant value) {
        if (value == null) {
            throw new IllegalArgumentException("CreatedAt cannot be null");
        }
        this.value = value;
    }

    public static CreatedAt from(Instant instant) {
        return new CreatedAt(instant);
    }

    public static CreatedAt now() {
        return new CreatedAt(Instant.now());
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
        CreatedAt createdAt = (CreatedAt) o;
        return Objects.equals(value, createdAt.value);
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

