-- +goose Up
ALTER TABLE headings
    DROP COLUMN count,
    ADD COLUMN text TEXT NOT NULL;

-- +goose Down
ALTER TABLE headings
    DROP COLUMN text,
    ADD COLUMN count INT DEFAULT 0;
