-- +goose Up
-- +goose StatementBegin

ALTER TABLE merchants ADD COLUMN topic_id VARCHAR(100);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE merchants DROP COLUMN topic_id;
-- +goose StatementEnd