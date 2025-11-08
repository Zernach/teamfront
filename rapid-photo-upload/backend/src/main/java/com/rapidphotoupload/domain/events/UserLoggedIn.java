package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.UserId;

import java.time.Instant;

/**
 * Domain event fired when a user logs in.
 */
public record UserLoggedIn(
    UserId userId,
    Instant occurredAt
) {
    public UserLoggedIn {
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static UserLoggedIn create(UserId userId) {
        return new UserLoggedIn(userId, Instant.now());
    }
}

