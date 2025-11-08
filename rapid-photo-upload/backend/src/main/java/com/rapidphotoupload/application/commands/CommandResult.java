package com.rapidphotoupload.application.commands;

import java.util.Optional;

/**
 * Result of executing a command.
 * Can represent either success or failure.
 */
public sealed interface CommandResult<T> {
    record Success<T>(T data) implements CommandResult<T> {}
    record Failure<T>(String errorCode, String errorMessage, Optional<Throwable> cause) implements CommandResult<T> {
        public Failure {
            if (errorCode == null || errorCode.trim().isEmpty()) {
                throw new IllegalArgumentException("ErrorCode cannot be null or empty");
            }
            if (errorMessage == null || errorMessage.trim().isEmpty()) {
                throw new IllegalArgumentException("ErrorMessage cannot be null or empty");
            }
            if (cause == null) {
                cause = Optional.empty();
            }
        }

        public Failure(String errorCode, String errorMessage) {
            this(errorCode, errorMessage, Optional.empty());
        }
    }

    static <T> CommandResult<T> success(T data) {
        return new Success<>(data);
    }

    static <T> CommandResult<T> failure(String errorCode, String errorMessage) {
        return new Failure<>(errorCode, errorMessage);
    }

    static <T> CommandResult<T> failure(String errorCode, String errorMessage, Throwable cause) {
        return new Failure<>(errorCode, errorMessage, Optional.of(cause));
    }

    default boolean isSuccess() {
        return this instanceof Success;
    }

    default boolean isFailure() {
        return this instanceof Failure;
    }
}

