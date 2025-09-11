-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,
    -- merchant id
    name VARCHAR(50) UNIQUE NOT NULL,
    payment_id VARCHAR(10),
    profile_image_url VARCHAR(2048),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE stores;
-- +goose StatementEnd