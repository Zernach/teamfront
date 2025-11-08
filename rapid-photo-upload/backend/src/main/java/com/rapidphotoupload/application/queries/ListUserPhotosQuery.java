package com.rapidphotoupload.application.queries;

import com.rapidphotoupload.domain.valueobjects.UserId;

/**
 * Query to list user's photos with pagination.
 */
public record ListUserPhotosQuery(
    UserId userId,
    int page,
    int pageSize,
    String sortBy, // e.g., "uploadedAt", "filename"
    String sortOrder // "asc" or "desc"
) implements Query<com.rapidphotoupload.application.dtos.PhotoListDTO> {
    public ListUserPhotosQuery {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        if (page < 0) {
            throw new IllegalArgumentException("Page cannot be negative");
        }
        if (pageSize <= 0 || pageSize > 100) {
            throw new IllegalArgumentException("PageSize must be between 1 and 100");
        }
        if (sortBy == null || sortBy.trim().isEmpty()) {
            sortBy = "uploadedAt";
        }
        if (sortOrder == null || sortOrder.trim().isEmpty()) {
            sortOrder = "desc";
        }
        if (!sortOrder.equals("asc") && !sortOrder.equals("desc")) {
            throw new IllegalArgumentException("SortOrder must be 'asc' or 'desc'");
        }
    }

    public ListUserPhotosQuery(UserId userId, int page, int pageSize) {
        this(userId, page, pageSize, "uploadedAt", "desc");
    }
}

