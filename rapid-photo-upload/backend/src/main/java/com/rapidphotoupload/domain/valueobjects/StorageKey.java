package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;

/**
 * StorageKey value object representing the path/key in cloud storage (S3/Azure blob).
 */
public final class StorageKey {
    private final String value;

    private StorageKey(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("StorageKey cannot be null or empty");
        }
        this.value = value.trim();
    }

    public static StorageKey from(String key) {
        return new StorageKey(key);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StorageKey that = (StorageKey) o;
        return Objects.equals(value, that.value);
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

