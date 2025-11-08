-- Migration: Create users table
-- Version: 1
-- Description: Creates users table with authentication and quota tracking

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    roles TEXT[] NOT NULL DEFAULT ARRAY['USER']::TEXT[],
    storage_quota BIGINT NOT NULL DEFAULT 10737418240, -- 10GB in bytes
    used_storage BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT users_username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
    CONSTRAINT users_storage_quota_positive CHECK (storage_quota >= 0),
    CONSTRAINT users_used_storage_positive CHECK (used_storage >= 0)
);

-- Indexes for users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with authentication and storage quota';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN users.username IS 'Unique username (3-50 characters)';
COMMENT ON COLUMN users.email IS 'Unique email address';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.roles IS 'Array of user roles (USER, ADMIN)';
COMMENT ON COLUMN users.storage_quota IS 'Storage quota in bytes (default 10GB)';
COMMENT ON COLUMN users.used_storage IS 'Currently used storage in bytes';

