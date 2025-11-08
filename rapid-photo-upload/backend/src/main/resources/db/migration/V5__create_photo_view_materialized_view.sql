-- Migration: Create photo_view materialized view
-- Version: 5
-- Description: Creates materialized view for optimized photo queries with aggregated tags

CREATE MATERIALIZED VIEW photo_view AS
SELECT 
    p.id AS photo_id,
    p.user_id,
    p.filename,
    p.file_size,
    p.content_type,
    p.status,
    p.storage_key,
    p.thumbnail_storage_key,
    p.uploaded_at,
    p.width,
    p.height,
    p.file_hash,
    COALESCE(
        ARRAY_AGG(DISTINCT t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL),
        ARRAY[]::TEXT[]
    ) AS tags
FROM photos p
LEFT JOIN photo_tags pt ON p.id = pt.photo_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY 
    p.id, p.user_id, p.filename, p.file_size, p.content_type, p.status,
    p.storage_key, p.thumbnail_storage_key, p.uploaded_at, p.width, p.height, p.file_hash;

-- Indexes for materialized view
CREATE INDEX idx_photo_view_user_uploaded_at ON photo_view(user_id, uploaded_at DESC);
CREATE INDEX idx_photo_view_status ON photo_view(status) WHERE status IN ('COMPLETED', 'FAILED');
CREATE INDEX idx_photo_view_tags ON photo_view USING GIN(tags);

-- Comments for documentation
COMMENT ON MATERIALIZED VIEW photo_view IS 'Optimized view of photos with aggregated tags for read queries';
COMMENT ON COLUMN photo_view.photo_id IS 'Photo identifier';
COMMENT ON COLUMN photo_view.user_id IS 'User who uploaded the photo';
COMMENT ON COLUMN photo_view.tags IS 'Array of tag names associated with the photo';

