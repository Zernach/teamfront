# Materialized View Design Plan

## Overview

The `photo_view` materialized view will be used to optimize read queries for listing user photos. This view aggregates photo data with tags and provides a denormalized, read-optimized structure.

## View Structure

### photo_view Materialized View

```sql
CREATE MATERIALIZED VIEW photo_view AS
SELECT 
    p.id AS photo_id,
    p.filename,
    p.file_size,
    p.content_type,
    p.status,
    p.storage_key,
    p.thumbnail_storage_key,
    p.uploaded_at,
    p.uploaded_by_user_id,
    p.width,
    p.height,
    p.file_hash,
    COALESCE(
        ARRAY_AGG(DISTINCT pt.tag) FILTER (WHERE pt.tag IS NOT NULL),
        ARRAY[]::text[]
    ) AS tags
FROM photos p
LEFT JOIN photo_tags pt ON p.id = pt.photo_id
GROUP BY p.id, p.filename, p.file_size, p.content_type, p.status, 
         p.storage_key, p.thumbnail_storage_key, p.uploaded_at, 
         p.uploaded_by_user_id, p.width, p.height, p.file_hash;
```

## Indexes

```sql
-- Index for user-based queries (most common)
CREATE INDEX idx_photo_view_user_uploaded_at 
ON photo_view(uploaded_by_user_id, uploaded_at DESC);

-- Index for status filtering
CREATE INDEX idx_photo_view_status 
ON photo_view(status) WHERE status IN ('COMPLETED', 'FAILED');

-- Index for tag searches (if needed)
CREATE INDEX idx_photo_view_tags 
ON photo_view USING GIN(tags);
```

## Refresh Strategy

### Option 1: On-Demand Refresh (Recommended for MVP)
- Refresh manually after photo uploads complete
- Refresh on scheduled intervals (e.g., every 5 minutes)
- Simple to implement, acceptable for moderate load

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY photo_view;
```

### Option 2: Event-Driven Refresh (Future Enhancement)
- Use database triggers to refresh after photo/tag changes
- More complex but provides near-real-time consistency
- Better for high-volume scenarios

### Option 3: Incremental Refresh (Future Enhancement)
- Track changes and update only affected rows
- Most complex but most efficient for large datasets
- Requires change tracking infrastructure

## Implementation Notes

1. **Initial Implementation**: Will use Option 1 (on-demand refresh)
2. **Refresh Timing**: After batch upload completion, refresh view
3. **Concurrent Refresh**: Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` to avoid blocking reads
4. **Index Maintenance**: Indexes will be maintained automatically by PostgreSQL

## Query Performance Expectations

- **List User Photos**: O(log n) with index on user_id + uploaded_at
- **Tag Filtering**: O(log n) with GIN index on tags array
- **Status Filtering**: O(log n) with partial index on status

## Migration Plan

1. Create materialized view in database schema migration (Epic 1, Story 1-4)
2. Create indexes in same migration
3. Implement refresh logic in infrastructure layer (Epic 1, Story 1-6)
4. Use view in query handlers (Epic 4, Story 4-1)

## References

- PostgreSQL Materialized Views: https://www.postgresql.org/docs/current/sql-creatematerializedview.html
- GIN Indexes for Arrays: https://www.postgresql.org/docs/current/gin.html

