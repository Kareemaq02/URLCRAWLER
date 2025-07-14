-- +goose Up
CREATE TABLE links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_id INT NOT NULL,
    href TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL,
    status_code INT,
    is_broken BOOLEAN NOT NULL,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS links;
