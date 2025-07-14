-- +goose Up
ALTER TABLE users
    ADD COLUMN first_name VARCHAR(255) NOT NULL,
    ADD COLUMN last_name VARCHAR(255) NOT NULL;
-- +goose Down
ALTER TABLE users
    DROP COLUMN first_name,
    DROP COLUMN last_name,