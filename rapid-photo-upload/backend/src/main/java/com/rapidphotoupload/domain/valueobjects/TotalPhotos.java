package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;

/**
 * TotalPhotos value object representing the total number of photos in an upload job.
 */
public final class TotalPhotos {
    private final int value;

    private TotalPhotos(int value) {
        if (value <= 0) {
            throw new IllegalArgumentException("TotalPhotos must be greater than 0");
        }
        this.value = value;
    }

    public static TotalPhotos from(int count) {
        return new TotalPhotos(count);
    }

    public int getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TotalPhotos that = (TotalPhotos) o;
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

