package com.rapidphotoupload.domain.aggregates;

import com.rapidphotoupload.domain.valueobjects.TagId;
import com.rapidphotoupload.domain.valueobjects.CreatedAt;

import java.util.Objects;

/**
 * Tag aggregate root.
 * Represents a tag that can be associated with photos.
 */
public class Tag {
    private TagId id;
    private String name;
    private CreatedAt createdAt;

    // Private constructor for aggregate creation
    private Tag() {}

    /**
     * Factory method to create a new Tag aggregate.
     */
    public static Tag create(TagId id, String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Tag name cannot be null or empty");
        }
        Tag tag = new Tag();
        tag.id = id;
        tag.name = name.trim();
        tag.createdAt = CreatedAt.now();
        return tag;
    }

    // Getters
    public TagId getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public CreatedAt getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Tag tag = (Tag) o;
        return Objects.equals(id, tag.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

