-- Migration: Remove username unique constraint
-- Version: 6
-- Description: Allows multiple users to have the same username. Email remains unique.

-- Drop the unique constraint on username
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- Drop the index on username since it's no longer unique
DROP INDEX IF EXISTS idx_users_username;

-- Update comment to reflect that username is no longer unique
COMMENT ON COLUMN users.username IS 'Username (3-50 characters, not unique)';

