package com.rapidphotoupload.application.commands;

import com.rapidphotoupload.domain.valueobjects.PhotoId;
import com.rapidphotoupload.domain.valueobjects.UserId;

/**
 * Command to retry a failed photo upload.
 */
public record RetryFailedUploadCommand(
    PhotoId photoId,
    UserId userId
) implements Command {
    public RetryFailedUploadCommand {
        if (photoId == null) {
            throw new IllegalArgumentException("PhotoId cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
    }
}

