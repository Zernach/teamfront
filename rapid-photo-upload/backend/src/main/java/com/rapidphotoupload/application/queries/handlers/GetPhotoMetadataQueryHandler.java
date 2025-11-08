package com.rapidphotoupload.application.queries.handlers;

import com.rapidphotoupload.application.dtos.PhotoDTO;
import com.rapidphotoupload.application.queries.GetPhotoMetadataQuery;
import com.rapidphotoupload.application.queries.Query;

import java.util.Optional;

/**
 * Handler for GetPhotoMetadataQuery.
 * Implementation will be completed in Epic 4.
 */
public class GetPhotoMetadataQueryHandler implements QueryHandler<GetPhotoMetadataQuery, PhotoDTO> {
    @Override
    public Optional<PhotoDTO> handle(GetPhotoMetadataQuery query) {
        // TODO: Implement in Epic 4 - Photo Query API
        // This will query the photo repository and return PhotoDTO
        throw new UnsupportedOperationException("GetPhotoMetadataQueryHandler not yet implemented");
    }

    @Override
    public Class<GetPhotoMetadataQuery> getQueryType() {
        return GetPhotoMetadataQuery.class;
    }
}

