-- Migration: Create photos table
-- Version: 3
-- Description: Creates photos table for photo metadata

CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'QUEUED',
    storage_key VARCHAR(500),
    thumbnail_storage_key VARCHAR(500),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    width INTEGER,
    height INTEGER,
    file_hash VARCHAR(64),
    CONSTRAINT photos_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT photos_file_size_positive CHECK (file_size > 0),
    CONSTRAINT photos_filename_not_empty CHECK (char_length(filename) > 0),
    CONSTRAINT photos_status_valid CHECK (status IN ('QUEUED', 'UPLOADING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    CONSTRAINT photos_content_type_valid CHECK (content_type LIKE 'image/%')
);

-- Indexes for photos table
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_status ON photos(status);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX idx_photos_user_uploaded_at ON photos(user_id, uploaded_at DESC);
CREATE INDEX idx_photos_storage_key ON photos(storage_key) WHERE storage_key IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE photos IS 'Photo metadata and upload tracking';
COMMENT ON COLUMN photos.id IS 'Unique photo identifier (UUID)';
COMMENT ON COLUMN photos.user_id IS 'User who uploaded the photo';
COMMENT ON COLUMN photos.filename IS 'Original filename';
COMMENT ON COLUMN photos.file_size IS 'File size in bytes';
COMMENT ON COLUMN photos.content_type IS 'MIME type (must be image/*)';
COMMENT ON COLUMN photos.status IS 'Current upload status';
COMMENT ON COLUMN photos.storage_key IS 'Cloud storage key/path';
COMMENT ON COLUMN photos.thumbnail_storage_key IS 'Thumbnail cloud storage key/path';
COMMENT ON COLUMN photos.uploaded_at IS 'Upload timestamp';
COMMENT ON COLUMN photos.width IS 'Image width in pixels';
COMMENT ON COLUMN photos.height IS 'Image height in pixels';
COMMENT ON COLUMN photos.file_hash IS 'File hash (SHA-256)';

