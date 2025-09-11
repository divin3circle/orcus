-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS shops (
    id BIGSERIAL PRIMARY KEY,
    -- merchant id
    name VARCHAR(50) UNIQUE NOT NULL,
    payment_id VARCHAR(100),
    profile_image_url VARCHAR(2048),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE shops;
-- +goose StatementEnd
