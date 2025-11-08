package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;
import java.util.UUID;

/**
 * UploadedBy value object representing a reference to the User who uploaded the photo.
 */
public final class UploadedBy {
    private final UUID userId;

    private UploadedBy(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("UploadedBy userId cannot be null");
        }
        this.userId = userId;
    }

    public static UploadedBy from(UUID userId) {
        return new UploadedBy(userId);
    }

    public UUID getUserId() {
        return userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UploadedBy that = (UploadedBy) o;
        return Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId);
    }

    @Override
    public String toString() {
        return userId.toString();
    }
}

