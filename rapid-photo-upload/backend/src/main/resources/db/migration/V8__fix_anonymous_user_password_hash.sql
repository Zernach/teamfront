-- Migration: Fix anonymous user password hash
-- Version: 8
-- Description: Updates the anonymous user's password hash to a valid bcrypt hash
--              This fixes the issue where the original migration used an invalid hash

UPDATE users
SET password_hash = '$2b$12$kr5eNoLE1pUCVOCs8aS3.uKzQx41SHb/QNXz8R/1Fp82kJNgSg5uO'
WHERE id = '00000000-0000-0000-0000-000000000000'
  AND username = 'anonymous_user';
