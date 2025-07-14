-- +goose Up
ALTER TABLE links
    MODIFY status_code INT DEFAULT 0,
    MODIFY is_broken BOOLEAN DEFAULT false;

-- +goose Down
ALTER TABLE links
    MODIFY status_code INT,
    MODIFY is_broken BOOLEAN;
