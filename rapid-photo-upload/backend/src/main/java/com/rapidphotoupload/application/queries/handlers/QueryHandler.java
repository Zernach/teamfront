package com.rapidphotoupload.application.queries.handlers;

import com.rapidphotoupload.application.queries.Query;

import java.util.Optional;

/**
 * Base interface for query handlers.
 * Each query handler processes a specific query type and returns a result.
 */
public interface QueryHandler<Q extends Query<T>, T> {
    /**
     * Handle the query and return a result.
     * Returns Optional.empty() if the query result is not found.
     */
    Optional<T> handle(Q query);

    /**
     * Get the query type this handler processes.
     */
    Class<Q> getQueryType();
}

