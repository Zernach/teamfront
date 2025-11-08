package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;

/**
 * StorageQuota value object representing storage quota in bytes.
 */
public final class StorageQuota {
    private final long value;

    private StorageQuota(long value) {
        if (value < 0) {
            throw new IllegalArgumentException("StorageQuota cannot be negative");
        }
        this.value = value;
    }

    public static StorageQuota from(long bytes) {
        return new StorageQuota(bytes);
    }

    public static StorageQuota fromGigabytes(long gigabytes) {
        return new StorageQuota(gigabytes * 1024L * 1024L * 1024L);
    }

    public long getValue() {
        return value;
    }

    public long getBytes() {
        return value;
    }

    public double getGigabytes() {
        return value / (1024.0 * 1024.0 * 1024.0);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StorageQuota that = (StorageQuota) o;
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

