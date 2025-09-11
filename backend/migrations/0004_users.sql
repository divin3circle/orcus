-- goose Up
-- goose StatementBegin

CREATE TABLE  IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY NOT NULL,
    username VARCHAR(50),
    mobile_number VARCHAR(13),
    hashed_password VARCHAR(255),
    account_id VARCHAR(100),
    profile_image_url VARCHAR(2048),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to merchants table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column;
DROP TABLE IF EXISTS users;
-- +goose StatementEnd