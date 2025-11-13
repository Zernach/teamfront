-- Migration: Seed anonymous user
-- Version: 7
-- Description: Inserts a well-known anonymous user record that
--              backend controllers rely on when requests are unauthenticated.

INSERT INTO users (
    id,
    username,
    email,
    password_hash,
    roles,
    storage_quota,
    used_storage,
    created_at,
    last_login_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'anonymous_user',
    'anonymous@rapid-photo-upload.local',
    'ANONYMOUS_USER_NO_LOGIN',
    ARRAY['ANONYMOUS']::TEXT[],
    1099511627776, -- 1 TB quota to avoid throttling anonymous uploads
    0,
    CURRENT_TIMESTAMP,
    NULL
)
ON CONFLICT DO NOTHING;
