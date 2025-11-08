package com.rapidphotoupload.domain.repositories;

import com.rapidphotoupload.domain.aggregates.User;
import com.rapidphotoupload.domain.valueobjects.UserId;
import com.rapidphotoupload.domain.valueobjects.Username;
import com.rapidphotoupload.domain.valueobjects.Email;

import java.util.Optional;

/**
 * Repository interface for User aggregate.
 * This is a domain contract, implementation will be in infrastructure layer.
 */
public interface UserRepository {
    /**
     * Save a user aggregate.
     */
    void save(User user);

    /**
     * Find user by ID.
     */
    Optional<User> findById(UserId userId);

    /**
     * Find user by username.
     */
    Optional<User> findByUsername(Username username);

    /**
     * Find user by email.
     */
    Optional<User> findByEmail(Email email);

    /**
     * Check if username exists.
     */
    boolean existsByUsername(Username username);

    /**
     * Check if email exists.
     */
    boolean existsByEmail(Email email);
}

