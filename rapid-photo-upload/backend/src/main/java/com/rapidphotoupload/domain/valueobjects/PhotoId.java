package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;
import java.util.UUID;

/**
 * PhotoId value object representing a unique identifier for a Photo aggregate.
 * Immutable and validated.
 */
public final class PhotoId {
    private final UUID value;

    private PhotoId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("PhotoId cannot be null");
        }
        this.value = value;
    }

    public static PhotoId from(UUID uuid) {
        return new PhotoId(uuid);
    }

    public static PhotoId generate() {
        return new PhotoId(UUID.randomUUID());
    }

    public UUID getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PhotoId photoId = (PhotoId) o;
        return Objects.equals(value, photoId.value);
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

