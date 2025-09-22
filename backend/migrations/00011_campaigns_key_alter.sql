-- +goose Up
-- +goose StatementBegin
ALTER TABLE campaigns
ADD COLUMN participants BIGINT NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE campaigns
DROP COLUMN participants;
-- +goose StatementEnd