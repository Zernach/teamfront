package com.rapidphotoupload.domain.valueobjects;

import java.time.Instant;
import java.util.Objects;

/**
 * LastLoginAt value object representing last login timestamp.
 * Can be null if user has never logged in.
 */
public final class LastLoginAt {
    private final Instant value;

    private LastLoginAt(Instant value) {
        // Allow null for users who have never logged in
        this.value = value;
    }

    public static LastLoginAt from(Instant instant) {
        return new LastLoginAt(instant);
    }

    public static LastLoginAt now() {
        return new LastLoginAt(Instant.now());
    }

    public static LastLoginAt never() {
        return new LastLoginAt(null);
    }

    public Instant getValue() {
        return value;
    }

    public boolean hasLoggedIn() {
        return value != null;
    }

    public String toIso8601() {
        return value != null ? value.toString() : null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LastLoginAt that = (LastLoginAt) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value != null ? value.toString() : "never";
    }
}

