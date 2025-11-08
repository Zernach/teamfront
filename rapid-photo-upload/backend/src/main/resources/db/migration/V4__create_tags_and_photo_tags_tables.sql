-- Migration: Create tags and photo_tags tables
-- Version: 4
-- Description: Creates tags table and photo_tags junction table for many-to-many relationships

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tags_name_not_empty CHECK (char_length(name) > 0)
);

-- Photo tags junction table
CREATE TABLE photo_tags (
    photo_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT photo_tags_pk PRIMARY KEY (photo_id, tag_id),
    CONSTRAINT photo_tags_photo_id_fk FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    CONSTRAINT photo_tags_tag_id_fk FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Indexes for tags table
CREATE INDEX idx_tags_name ON tags(name);

-- Indexes for photo_tags table
CREATE INDEX idx_photo_tags_photo_id ON photo_tags(photo_id);
CREATE INDEX idx_photo_tags_tag_id ON photo_tags(tag_id);

-- Comments for documentation
COMMENT ON TABLE tags IS 'Photo tags';
COMMENT ON COLUMN tags.id IS 'Unique tag identifier (UUID)';
COMMENT ON COLUMN tags.name IS 'Tag name (unique)';
COMMENT ON TABLE photo_tags IS 'Many-to-many relationship between photos and tags';
COMMENT ON COLUMN photo_tags.photo_id IS 'Photo identifier';
COMMENT ON COLUMN photo_tags.tag_id IS 'Tag identifier';

