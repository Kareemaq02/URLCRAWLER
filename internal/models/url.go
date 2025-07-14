package models

import (
	"fmt"
	"time"
	"urlcrawler/internal/db"

	"gorm.io/gorm"
)

// URLStatus defines possible statuses for a URL crawl process.
type URLStatus string

const (
	URLStatusQueued     URLStatus = "queued"
	URLStatusProcessing URLStatus = "processing"
	URLStatusDone       URLStatus = "done"
	URLStatusError      URLStatus = "error"
	URLStatusStopped    URLStatus = "stopped"
)

// URL represents a crawled URL record with metadata and status.
type URL struct {
	ID           int       `gorm:"primaryKey;autoIncrement"`
	UserID       int       `gorm:"not null"`
	URL          string    `gorm:"not null"`
	Title        string
	HTMLVersion  string
	HasLoginForm bool
	Status       URLStatus
	ErrorMessage string
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`
}

// InsertURL inserts a new URL record into the database.
func InsertURL(u *URL) error {
	return db.DB.Create(u).Error
}

// GetURLByID retrieves a URL by its ID.
func GetURLByID(id int) (*URL, error) {
	var u URL
	err := db.DB.First(&u, id).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// UpdateURLStatus updates only the status field of a URL record.
func UpdateURLStatus(urlID int, status URLStatus) error {
	return db.DB.Model(&URL{}).
		Where("id = ?", urlID).
		Update("status", status).
		Error
}

// UpdateURLStatusWithError updates the status and error message fields of a URL record.
func UpdateURLStatusWithError(urlID int, status URLStatus, errMsg string) error {
	return db.DB.Model(&URL{}).
		Where("id = ?", urlID).
		Updates(map[string]interface{}{
			"status":        status,
			"error_message": errMsg,
		}).Error
}

// UpdateURL saves the full URL struct, updating all fields.
func UpdateURL(u *URL) error {
	return db.DB.Save(u).Error
}

// GetAllURLs returns all URL records ordered by last update descending.
func GetAllURLs() ([]URL, error) {
	var urls []URL
	err := db.DB.Order("updated_at DESC").Find(&urls).Error
	return urls, err
}

// DeleteURLByID deletes a URL by ID, using a transaction for safety.
// Relies on ON DELETE CASCADE for related records.
func DeleteURLByID(id int) error {
	return db.DB.Transaction(func(tx *gorm.DB) error {
		result := tx.Delete(&URL{}, id)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("URL with ID %d not found", id)
		}
		// Related data deletion handled by DB constraints
		return nil
	})
}
