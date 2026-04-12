-- Align SQL migrations with current persistence models.
-- Safe on both fresh installs and existing databases.

-- users: add fields added after initial migration
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';

-- redeem_codes: subscription redeem fields
ALTER TABLE redeem_codes ADD COLUMN IF NOT EXISTS group_id BIGINT REFERENCES groups(id) ON DELETE SET NULL;
ALTER TABLE redeem_codes ADD COLUMN IF NOT EXISTS validity_days INT NOT NULL DEFAULT 30;
CREATE INDEX IF NOT EXISTS idx_redeem_codes_group_id ON redeem_codes(group_id);

-- settings: key-value store
CREATE TABLE IF NOT EXISTS settings (
    id          BIGSERIAL PRIMARY KEY,
    key         VARCHAR(100) NOT NULL UNIQUE,
    value       TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
