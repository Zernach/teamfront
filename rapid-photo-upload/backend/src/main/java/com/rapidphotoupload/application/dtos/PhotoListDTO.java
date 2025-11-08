package com.rapidphotoupload.application.dtos;

import java.util.List;

/**
 * Data Transfer Object for paginated photo list.
 */
public record PhotoListDTO(
    List<PhotoDTO> photos,
    int page,
    int pageSize,
    int totalPages,
    long totalCount,
    boolean hasNext,
    boolean hasPrevious
) {
    public PhotoListDTO {
        if (photos == null) {
            photos = List.of();
        }
        if (page < 0) {
            throw new IllegalArgumentException("Page cannot be negative");
        }
        if (pageSize <= 0) {
            throw new IllegalArgumentException("PageSize must be greater than 0");
        }
        if (totalPages < 0) {
            throw new IllegalArgumentException("TotalPages cannot be negative");
        }
        if (totalCount < 0) {
            throw new IllegalArgumentException("TotalCount cannot be negative");
        }
    }
}

