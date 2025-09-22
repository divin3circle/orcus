-- +goose Up
-- +goose StatementBegin
ALTER TABLE shops
ADD COLUMN theme VARCHAR(50) NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE shops
DROP COLUMN theme;
-- +goose StatementEnd