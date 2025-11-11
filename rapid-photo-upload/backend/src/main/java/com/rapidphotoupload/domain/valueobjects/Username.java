package com.rapidphotoupload.domain.valueobjects;

import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Username value object with validation (3-50 characters, unique constraint enforced at repository level).
 */
public final class Username {
    private static final int MIN_LENGTH = 3;
    private static final int MAX_LENGTH = 50;
    // Allow letters, numbers, spaces, and common punctuation for full names
    private static final Pattern VALID_PATTERN = Pattern.compile("^[a-zA-Z0-9_\\s\\-\\.']+$");

    private final String value;

    private Username(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        String trimmed = value.trim();
        if (trimmed.length() < MIN_LENGTH || trimmed.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Username must be between %d and %d characters", MIN_LENGTH, MAX_LENGTH)
            );
        }
        if (!VALID_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("Full name can only contain letters, numbers, spaces, hyphens, periods, and apostrophes");
        }
        this.value = trimmed;
    }

    public static Username from(String username) {
        return new Username(username);
    }

    public String getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Username username = (Username) o;
        return Objects.equals(value, username.value);
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

