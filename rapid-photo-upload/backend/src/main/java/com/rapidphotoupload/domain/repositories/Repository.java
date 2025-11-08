package com.rapidphotoupload.domain.repositories;

import java.util.Optional;

/**
 * Generic repository interface pattern.
 * Provides common CRUD operations for aggregates.
 * 
 * @param <T> Aggregate root type
 * @param <ID> Aggregate ID type (value object)
 */
public interface Repository<T, ID> {
    /**
     * Save an aggregate.
     */
    void save(T aggregate);

    /**
     * Find aggregate by ID.
     */
    Optional<T> findById(ID id);

    /**
     * Delete an aggregate.
     */
    void delete(ID id);
}

