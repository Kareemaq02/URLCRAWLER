package seed

import (
	"log"
	"urlcrawler/internal/auth"
	"urlcrawler/internal/config"
	"urlcrawler/internal/models"
)

// EnsureAdminUserExists checks if an admin user exists, and if not, creates one.
// It uses credentials from the app configuration.
func EnsureAdminUserExists() error {
	adminEmail := config.Cfg.AdminEmail
	adminPassword := config.Cfg.AdminPassword

	// Check if the admin user already exists by email
	existingAdmin, err := models.GetUserByEmail(adminEmail)
	if err != nil {
	    log.Printf("⚠️ Checking admin user: %v. Proceeding to create admin user...", err)
	}
	if existingAdmin != nil {
	    log.Println("👤 Admin account already exists")
	    return nil
	}

	// Hash the admin password before storing
	hashedPassword, err := auth.HashPassword(adminPassword)
	if err != nil {
		return err
	}

	// Create the admin user with role "admin"
	_, err = models.CreateUser("admin", "admin", adminEmail, hashedPassword, "admin")
	if err != nil {
		return err
	}

	log.Println("✅ Admin account created")
	return nil
}
