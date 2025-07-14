package models

import "urlcrawler/internal/db"

type Heading struct {
	ID     int    `gorm:"primaryKey;autoIncrement"`
	URLID  int    `gorm:"not null;index"`
	Tag    string `gorm:"not null"` // e.g. "h1", "h2"
	Text   string `gorm:"not null"`
}

func InsertHeading(h Heading) error {
	return db.DB.Create(&h).Error
}

func DeleteHeadingsByURLID(urlID int) error {
	return db.DB.Where("url_id = ?", urlID).Delete(&Heading{}).Error
}
