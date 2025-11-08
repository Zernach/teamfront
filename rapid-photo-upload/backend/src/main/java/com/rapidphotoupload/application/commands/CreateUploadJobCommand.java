package com.rapidphotoupload.application.commands;

import com.rapidphotoupload.domain.valueobjects.UserId;

/**
 * Command to create a new upload job for batch photo uploads.
 */
public record CreateUploadJobCommand(
    UserId userId,
    int totalPhotos
) implements Command {
    public CreateUploadJobCommand {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        if (totalPhotos <= 0) {
            throw new IllegalArgumentException("TotalPhotos must be greater than 0");
        }
        if (totalPhotos > 100) {
            throw new IllegalArgumentException("TotalPhotos cannot exceed 100");
        }
    }
}

