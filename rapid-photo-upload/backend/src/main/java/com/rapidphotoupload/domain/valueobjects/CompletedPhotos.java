package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;

/**
 * CompletedPhotos value object representing the number of completed photos in an upload job.
 */
public final class CompletedPhotos {
    private final int value;

    private CompletedPhotos(int value) {
        if (value < 0) {
            throw new IllegalArgumentException("CompletedPhotos cannot be negative");
        }
        this.value = value;
    }

    public static CompletedPhotos from(int count) {
        return new CompletedPhotos(count);
    }

    public static CompletedPhotos zero() {
        return new CompletedPhotos(0);
    }

    public int getValue() {
        return value;
    }

    public CompletedPhotos increment() {
        return new CompletedPhotos(this.value + 1);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CompletedPhotos that = (CompletedPhotos) o;
        return value == that.value;
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return String.valueOf(value);
    }
}

