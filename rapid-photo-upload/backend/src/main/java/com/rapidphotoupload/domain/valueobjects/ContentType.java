package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * ContentType value object representing MIME type.
 * Validates that the content type is a valid image MIME type.
 */
public final class ContentType {
    private static final Set<String> VALID_IMAGE_TYPES = Set.of(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/bmp",
        "image/tiff",
        "image/heic",
        "image/heif"
    );

    private static final Pattern MIME_TYPE_PATTERN = Pattern.compile("^[a-z]+/[a-z0-9.+-]+$");

    private final String value;

    private ContentType(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("ContentType cannot be null or empty");
        }
        String normalized = value.toLowerCase().trim();
        if (!MIME_TYPE_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException("Invalid MIME type format: " + value);
        }
        if (!VALID_IMAGE_TYPES.contains(normalized)) {
            throw new IllegalArgumentException("ContentType must be a valid image MIME type: " + value);
        }
        this.value = normalized;
    }

    public static ContentType from(String mimeType) {
        return new ContentType(mimeType);
    }

    public String getValue() {
        return value;
    }

    public boolean isImage() {
        return value.startsWith("image/");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ContentType that = (ContentType) o;
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

