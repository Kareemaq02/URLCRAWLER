package db

import (
	"fmt"
	"log"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"

	"urlcrawler/internal/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB // Global GORM DB instance

// Init sets up the database connection and runs migrations.
// It ensures the DB exists, runs Goose migrations, and opens a GORM connection.
func Init() error {
	// Load DB config from global config
	user := config.Cfg.DBUser
	pass := config.Cfg.DBPass
	host := config.Cfg.DBHost
	port := config.Cfg.DBPort
	name := config.Cfg.DBName

	// Ensure the database itself exists before connecting
	if err := ensureDatabaseExists(user, pass, host, port, name); err != nil {
		return fmt.Errorf("failed to create database: %w", err)
	}

	// Build DSN string for MySQL connection
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4&loc=Local",
		user, pass, host, port, name)

	// Run Goose migrations (uses database/sql internally)
	if err := runGooseMigrations(dsn); err != nil {
		return err
	}

	// Connect to the database using GORM with warning log level
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to DB using GORM: %w", err)
	}

	// Configure connection pool settings
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	sqlDB.SetMaxOpenConns(10)         // Max open connections
	sqlDB.SetMaxIdleConns(5)          // Max idle connections
	sqlDB.SetConnMaxLifetime(time.Hour) // Max lifetime for a connection

	log.Println("✅ Goose migrations complete and GORM connected.")
	return nil
}

// runGooseMigrations runs migrations using the Goose CLI tool.
// It constructs the migrations directory path relative to this file.
func runGooseMigrations(dsn string) error {
	// Get the current file directory
	_, currentFile, _, _ := runtime.Caller(0)
	baseDir := filepath.Dir(currentFile)
	// Construct path to migrations folder
	migrationsDir := filepath.Join(baseDir, "..", "..", "migrations")

	// Run goose command: goose -dir <migrationsDir> mysql <dsn> up
	cmd := exec.Command("goose", "-dir", migrationsDir, "mysql", dsn, "up")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("goose migration failed: %v\nOutput:\n%s", err, string(output))
	}
	log.Println("📦 Goose migrations ran successfully")
	return nil
}
