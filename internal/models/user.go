package models

import (
	"time"
	"urlcrawler/internal/db"
)

// UserRole defines roles a user can have.
type UserRole string

const (
	UserRoleUser  UserRole = "user"
	UserRoleAdmin UserRole = "admin"
)

// User represents a user in the system.
type User struct {
	ID           int       `gorm:"column:id;primaryKey;autoIncrement"`
	FirstName    string    `gorm:"column:first_name;not null"`
	LastName     string    `gorm:"column:last_name;not null"`
	Email        string    `gorm:"column:email;unique;not null"`
	PasswordHash string    `gorm:"column:password_hash;not null"`
	Role         UserRole  `gorm:"column:role;not null"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime"`
}

// TableName sets the table name for GORM.
func (User) TableName() string {
	return "users"
}

// CreateUser creates a new user record.
func CreateUser(firstName, lastName, email, passwordHash string, role UserRole) (*User, error) {
	user := &User{
		FirstName:    firstName,
		LastName:     lastName,
		Email:        email,
		PasswordHash: passwordHash,
		Role:         role,
		CreatedAt:    time.Now(),
	}

	if err := db.DB.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByEmail fetches a user by their email address.
func GetUserByEmail(email string) (*User, error) {
	var user User
	if err := db.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
