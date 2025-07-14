package models

import "urlcrawler/internal/db"

// Link represents a link found on a crawled URL.
type Link struct {
	ID         int    `gorm:"primaryKey;autoIncrement"`
	URLID      int    `gorm:"not null;index"`
	Href       string `gorm:"not null"`
	IsInternal bool `gorm:"not null"`			 // Indicates if the link is internal to the base URL's domain
	StatusCode int    `gorm:"default:0"`         // HTTP status code returned when checking the link; 0 means not checked yet
	IsBroken   bool   `gorm:"default:false"`     // True if the link is identified as broken
}

// InsertLink inserts a new Link record into the database.
func InsertLink(l Link) error {
	return db.DB.Create(&l).Error
}

// DeleteLinksByURLID deletes all links associated with a given URL ID.
func DeleteLinksByURLID(urlID int) error {
	return db.DB.Where("url_id = ?", urlID).Delete(&Link{}).Error
}

// LinkCount holds counts of internal and external links for a URL.
type LinkCount struct {
	Internal int64 `json:"internal"`
	External int64 `json:"external"`
}

// GetLinkCountByURLID returns the count of internal and external links for a given URL ID.
func GetLinkCountByURLID(urlID int) (*LinkCount, error) {
	var internalCount int64
	var externalCount int64

	if err := db.DB.
		Model(&Link{}).
		Where("url_id = ? AND is_internal = true", urlID).
		Count(&internalCount).Error; err != nil {
		return nil, err
	}

	if err := db.DB.
		Model(&Link{}).
		Where("url_id = ? AND is_internal = false", urlID).
		Count(&externalCount).Error; err != nil {
		return nil, err
	}

	return &LinkCount{
		Internal: internalCount,
		External: externalCount,
	}, nil
}

// BrokenLink represents a broken link with its href and HTTP status code.
type BrokenLink struct {
	Href       string `json:"href"`
	StatusCode int    `json:"status_code"`
}

// GetBrokenLinksByURLID returns all broken links for a given URL ID.
func GetBrokenLinksByURLID(urlID int) ([]BrokenLink, error) {
	var brokenLinks []BrokenLink

	err := db.DB.
		Model(&Link{}).
		Select("href, status_code").
		Where("url_id = ? AND is_broken = true", urlID).
		Scan(&brokenLinks).Error

	if err != nil {
		return nil, err
	}

	return brokenLinks, nil
}
