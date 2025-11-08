package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;

/**
 * UsedStorage value object representing used storage in bytes.
 */
public final class UsedStorage {
    private final long value;

    private UsedStorage(long value) {
        if (value < 0) {
            throw new IllegalArgumentException("UsedStorage cannot be negative");
        }
        this.value = value;
    }

    public static UsedStorage from(long bytes) {
        return new UsedStorage(bytes);
    }

    public static UsedStorage zero() {
        return new UsedStorage(0);
    }

    public long getValue() {
        return value;
    }

    public long getBytes() {
        return value;
    }

    public UsedStorage add(long bytes) {
        return new UsedStorage(this.value + bytes);
    }

    public UsedStorage subtract(long bytes) {
        if (this.value < bytes) {
            throw new IllegalArgumentException("Cannot subtract more than current used storage");
        }
        return new UsedStorage(this.value - bytes);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UsedStorage that = (UsedStorage) o;
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

