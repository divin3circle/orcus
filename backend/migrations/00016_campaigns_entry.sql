-- +goose Up
-- +goose StatementBegin

-- Enable UUID extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS campaigns_entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_balance BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE campaigns_entry;
-- +goose StatementEnd