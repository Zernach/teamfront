package com.rapidphotoupload.application.commands;

import com.rapidphotoupload.domain.valueobjects.Filename;
import com.rapidphotoupload.domain.valueobjects.FileSize;
import com.rapidphotoupload.domain.valueobjects.ContentType;
import com.rapidphotoupload.domain.valueobjects.UserId;
import com.rapidphotoupload.domain.valueobjects.JobId;

import java.util.Set;

/**
 * Command to upload a single photo.
 */
public record UploadPhotoCommand(
    Filename filename,
    FileSize fileSize,
    ContentType contentType,
    UserId userId,
    JobId jobId, // Optional, null if single upload
    Set<String> tags
) implements Command {
    public UploadPhotoCommand {
        if (filename == null) {
            throw new IllegalArgumentException("Filename cannot be null");
        }
        if (fileSize == null) {
            throw new IllegalArgumentException("FileSize cannot be null");
        }
        if (contentType == null) {
            throw new IllegalArgumentException("ContentType cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        if (tags == null) {
            tags = Set.of();
        }
    }
}

