-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS merchants (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    mobile_number VARCHAR(13),
    password_hash VARCHAR(255) NOT NULL,
    account_id VARCHAR(100),
    profile_image_url VARCHAR(2048),
    account_banner_image_url VARCHAR(2048),
    auto_offramp INTEGER,
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
CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS update_merchants_updated_at ON merchants;
DROP FUNCTION IF EXISTS update_updated_at_column;
DROP TABLE IF EXISTS merchants;
-- +goose StatementEnd
