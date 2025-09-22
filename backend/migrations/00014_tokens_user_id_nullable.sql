-- +goose Up
-- +goose StatementBegin
ALTER TABLE tokens ALTER COLUMN user_id DROP NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE tokens ALTER COLUMN user_id SET NOT NULL;
-- +goose StatementEnd
