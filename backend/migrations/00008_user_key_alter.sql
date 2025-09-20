-- +goose Up
-- +goose StatementBegin
ALTER TABLE users
ADD COLUMN encrypted_key VARCHAR(255) NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users
DROP COLUMN key;
-- +goose StatementEnd