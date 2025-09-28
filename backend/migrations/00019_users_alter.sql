-- +goose Up
-- +goose StatementBegin

ALTER TABLE users ADD COLUMN topic_id VARCHAR(100);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN topic_id;
-- +goose StatementEnd