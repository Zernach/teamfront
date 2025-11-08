package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;

/**
 * Filename value object with validation rules.
 * Ensures filename is not null, not empty, and within reasonable length limits.
 */
public final class Filename {
    private static final int MAX_LENGTH = 255;
    private static final int MIN_LENGTH = 1;

    private final String value;

    private Filename(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Filename cannot be null or empty");
        }
        if (value.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("Filename cannot exceed " + MAX_LENGTH + " characters");
        }
        if (value.length() < MIN_LENGTH) {
            throw new IllegalArgumentException("Filename must be at least " + MIN_LENGTH + " character");
        }
        this.value = value.trim();
    }

    public static Filename from(String filename) {
        return new Filename(filename);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Filename filename = (Filename) o;
        return Objects.equals(value, filename.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value;
    }
}

