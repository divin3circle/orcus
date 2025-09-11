-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
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