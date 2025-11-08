package com.rapidphotoupload.domain.events;

import com.rapidphotoupload.domain.valueobjects.UserId;
import com.rapidphotoupload.domain.valueobjects.StorageQuota;
import com.rapidphotoupload.domain.valueobjects.UsedStorage;

import java.time.Instant;

/**
 * Domain event fired when a user's storage quota is exceeded.
 */
public record StorageQuotaExceeded(
    UserId userId,
    StorageQuota quota,
    UsedStorage used,
    long attemptedSize,
    Instant occurredAt
) {
    public StorageQuotaExceeded {
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }
        if (quota == null) {
            throw new IllegalArgumentException("quota cannot be null");
        }
        if (used == null) {
            throw new IllegalArgumentException("used cannot be null");
        }
        if (attemptedSize <= 0) {
            throw new IllegalArgumentException("attemptedSize must be greater than 0");
        }
        if (occurredAt == null) {
            throw new IllegalArgumentException("occurredAt cannot be null");
        }
    }

    public static StorageQuotaExceeded create(
        UserId userId,
        StorageQuota quota,
        UsedStorage used,
        long attemptedSize
    ) {
        return new StorageQuotaExceeded(userId, quota, used, attemptedSize, Instant.now());
    }
}

