package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;

/**
 * PasswordHash value object representing a bcrypt hashed password.
 * The actual hashing is done outside the domain layer, but this ensures
 * the hash is not null or empty.
 */
public final class PasswordHash {
    private final String value;

    private PasswordHash(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("PasswordHash cannot be null or empty");
        }
        if (!value.startsWith("$2a$") && !value.startsWith("$2b$") && !value.startsWith("$2y$")) {
            throw new IllegalArgumentException("PasswordHash must be a valid bcrypt hash");
        }
        this.value = value;
    }

    public static PasswordHash from(String hash) {
        return new PasswordHash(hash);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PasswordHash that = (PasswordHash) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return "[REDACTED]";
    }
}

