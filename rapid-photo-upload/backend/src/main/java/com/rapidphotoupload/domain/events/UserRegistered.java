package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.UserId;
import com.rapidphotoupload.domain.valueobjects.Username;
import com.rapidphotoupload.domain.valueobjects.Email;

import java.time.Instant;

/**
 * Domain event fired when a user is registered.
 */
public record UserRegistered(
    UserId userId,
    Username username,
    Email email,
    Instant occurredAt
) {
    public UserRegistered {
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }
        if (username == null) {
            throw new IllegalArgumentException("username cannot be null");
        }
        if (email == null) {
            throw new IllegalArgumentException("email cannot be null");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static UserRegistered create(UserId userId, Username username, Email email) {
        return new UserRegistered(userId, username, email, Instant.now());
    }
}

