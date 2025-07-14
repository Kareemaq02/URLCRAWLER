-- +goose Up
CREATE TABLE headings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url_id INT NOT NULL,
    tag VARCHAR(5) NOT NULL,
    count INT DEFAULT 0,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
);

-- +goose Down
DROP TABLE IF EXISTS headings;
