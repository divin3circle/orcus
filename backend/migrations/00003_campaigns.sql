-- +goose Up
-- +goose StatementBegin

-- Enable UUID extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(50) UNIQUE NOT NULL,
    token_id VARCHAR(13),
    description TEXT,
    target_tokens BIGINT,
    distributed BIGINT,
    icon VARCHAR(2048),
    banner_image_url VARCHAR(2048),
    ended INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE campaigns;
-- +goose StatementEnd