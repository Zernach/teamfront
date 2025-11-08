package com.rapidphotoupload.application.queries.handlers;

import com.rapidphotoupload.application.dtos.PhotoListDTO;
import com.rapidphotoupload.application.queries.ListUserPhotosQuery;
import com.rapidphotoupload.application.queries.Query;

import java.util.Optional;

/**
 * Handler for ListUserPhotosQuery.
 * Implementation will be completed in Epic 4.
 * Will use materialized view for optimized reads.
 */
public class ListUserPhotosQueryHandler implements QueryHandler<ListUserPhotosQuery, PhotoListDTO> {
    @Override
    public Optional<PhotoListDTO> handle(ListUserPhotosQuery query) {
        // TODO: Implement in Epic 4 - Photo Query API
        // This will query the photo_view materialized view for optimized reads
        throw new UnsupportedOperationException("ListUserPhotosQueryHandler not yet implemented");
    }

    @Override
    public Class<ListUserPhotosQuery> getQueryType() {
        return ListUserPhotosQuery.class;
    }
}

