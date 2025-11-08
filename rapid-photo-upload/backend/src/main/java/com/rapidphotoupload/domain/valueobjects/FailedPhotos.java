package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;

/**
 * FailedPhotos value object representing the number of failed photos in an upload job.
 */
public final class FailedPhotos {
    private final int value;

    private FailedPhotos(int value) {
        if (value < 0) {
            throw new IllegalArgumentException("FailedPhotos cannot be negative");
        }
        this.value = value;
    }

    public static FailedPhotos from(int count) {
        return new FailedPhotos(count);
    }

    public static FailedPhotos zero() {
        return new FailedPhotos(0);
    }

    public int getValue() {
        return value;
    }

    public FailedPhotos increment() {
        return new FailedPhotos(this.value + 1);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FailedPhotos that = (FailedPhotos) o;
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

