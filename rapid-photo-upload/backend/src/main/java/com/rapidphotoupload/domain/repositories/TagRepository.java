package com.rapidphotoupload.domain.repositories;

import com.rapidphotoupload.domain.aggregates.Tag;
import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.TagId;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Tag aggregate.
 * This is a domain contract, implementation will be in infrastructure layer.
 */
public interface TagRepository {
    /**
     * Save a tag aggregate.
     */
    void save(Tag tag);

    /**
     * Find tag by ID.
     */
    Optional<Tag> findById(TagId tagId);

    /**
     * Find tag by name.
     */
    Optional<Tag> findByName(String name);

    /**
     * Find all tags for a photo.
     */
    List<Tag> findByPhotoId(PhotoId photoId);

    /**
     * Check if tag exists by name.
     */
    boolean existsByName(String name);

    /**
     * Delete a tag.
     */
    void delete(TagId tagId);
}

