CREATE TABLE IF NOT EXISTS temp_roles (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)