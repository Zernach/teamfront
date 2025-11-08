package com.rapidphotoupload.application.queries.handlers;

import com.rapidphotoupload.application.dtos.UploadJobDTO;
import com.rapidphotoupload.application.queries.GetUploadJobStatusQuery;
import com.rapidphotoupload.application.queries.Query;

import java.util.Optional;

/**
 * Handler for GetUploadJobStatusQuery.
 * Implementation will be completed in Epic 4.
 */
public class GetUploadJobStatusQueryHandler implements QueryHandler<GetUploadJobStatusQuery, UploadJobDTO> {
    @Override
    public Optional<UploadJobDTO> handle(GetUploadJobStatusQuery query) {
        // TODO: Implement in Epic 4 - Photo Query API
        // This will query the upload job repository and return UploadJobDTO
        throw new UnsupportedOperationException("GetUploadJobStatusQueryHandler not yet implemented");
    }

    @Override
    public Class<GetUploadJobStatusQuery> getQueryType() {
        return GetUploadJobStatusQuery.class;
    }
}

