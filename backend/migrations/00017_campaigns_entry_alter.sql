-- +goose Up
-- +goose StatementBegin

ALTER TABLE campaigns_entry ADD COLUMN shop_id UUID REFERENCES shops(id) ON DELETE CASCADE;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE campaigns_entry;
-- +goose StatementEnd