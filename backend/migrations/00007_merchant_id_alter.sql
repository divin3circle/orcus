-- +goose Up
-- +goose StatementBegin
ALTER TABLE shops
ADD COLUMN merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE shops
DROP COLUMN merchant_id;
-- +goose StatementEnd