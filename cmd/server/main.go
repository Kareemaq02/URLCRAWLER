package main

import (
	"fmt"
	"log"
	"os"
	"urlcrawler/cmd/seed"
	"urlcrawler/internal/api"
	"urlcrawler/internal/config"
	"urlcrawler/internal/db"
	"urlcrawler/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func loadEnv() {
	// Load .env once (single env file)
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No .env file found. Using system environment variables.")
	} else {
		fmt.Println("📦 Loaded environment from .env")
	}
}

func main() {
	loadEnv()

	// Load all config values, including switching DB credentials based on APP_ENV internally
	config.Load()

	// Set Gin mode depending on APP_ENV
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
		fmt.Println("⚙️ Running in production mode (Gin ReleaseMode)")
	} else {
		gin.SetMode(gin.DebugMode)
		fmt.Println("⚙️ Running in development mode (Gin DebugMode)")
	}

	// Initialize database connection
	if err := db.Init(); err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}

	// Seed admin user if not exists
	if err := seed.EnsureAdminUserExists(); err != nil {
		log.Fatalf("❌ Failed to seed admin: %v", err)
	}

	// Setup Gin router with middleware and routes
	router := gin.Default()
	router.Use(middleware.CORSMiddleware())

	apiGroup := router.Group("/api")
	api.SetupRoutes(apiGroup)

	// Start server on configured port
	log.Printf("🚀 Server running on port %s", config.Cfg.ServerPort)
	if err := router.Run("0.0.0.0:" + config.Cfg.ServerPort); err != nil {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
}
