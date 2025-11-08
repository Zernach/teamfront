package com.rapidphotoupload.application.queries;

import com.rapidphotoupload.domain.valueobjects.JobId;
import com.rapidphotoupload.domain.valueobjects.UserId;

/**
 * Query to get upload job status by job ID.
 */
public record GetUploadJobStatusQuery(
    JobId jobId,
    UserId userId // For authorization check
) implements Query<com.rapidphotoupload.application.dtos.UploadJobDTO> {
    public GetUploadJobStatusQuery {
        if (jobId == null) {
            throw new IllegalArgumentException("JobId cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
    }
}

