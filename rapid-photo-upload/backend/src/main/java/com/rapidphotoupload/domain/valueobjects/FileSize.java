package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;

/**
 * FileSize value object representing file size in bytes.
 * Must be greater than 0.
 */
public final class FileSize {
    private final long value;

    private FileSize(long value) {
        if (value <= 0) {
            throw new IllegalArgumentException("FileSize must be greater than 0");
        }
        this.value = value;
    }

    public static FileSize from(long bytes) {
        return new FileSize(bytes);
    }

    public long getValue() {
        return value;
    }

    public long getBytes() {
        return value;
    }

    public double getKilobytes() {
        return value / 1024.0;
    }

    public double getMegabytes() {
        return value / (1024.0 * 1024.0);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FileSize fileSize = (FileSize) o;
        return value == fileSize.value;
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

