package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;
import java.util.UUID;

/**
 * TagId value object representing a unique identifier for a Tag.
 */
public final class TagId {
    private final UUID value;

    private TagId(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("TagId cannot be null");
        }
        this.value = value;
    }

    public static TagId from(UUID uuid) {
        return new TagId(uuid);
    }

    public static TagId generate() {
        return new TagId(UUID.randomUUID());
    }

    public UUID getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TagId tagId = (TagId) o;
        return Objects.equals(value, tagId.value);
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

