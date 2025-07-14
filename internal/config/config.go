package config

import (
	"log"
	"os"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	AppEnv        string `env:"APP_ENV"         env-default:"development"`
	DBUser        string
	DBPass        string
	DBHost        string
	DBPort        string `env:"DB_PORT"         env-default:"3306"`
	DBName        string
	JWTSecret     string `env:"JWT_SECRET"      env-required:"true"`
	ServerPort    string `env:"PORT"            env-default:"8080"`
	CORSOrigins   string `env:"CORS_ORIGINS"    env-required:"true"`
	AdminEmail    string `env:"ADMIN_EMAIL"     env-required:"true"`
	AdminPassword string `env:"ADMIN_PASSWORD"  env-required:"true"`
}


var Cfg Config

func Load() {
	// Load base env vars
	if err := cleanenv.ReadEnv(&Cfg); err != nil {
		log.Fatalf("❌ Failed to read environment variables: %v", err)
	}

	switch Cfg.AppEnv {
	case "production":
		Cfg.DBUser = os.Getenv("PROD_DB_USER")
		Cfg.DBPass = os.Getenv("PROD_DB_PASS")
		Cfg.DBHost = os.Getenv("PROD_DB_HOST")
		Cfg.DBName = os.Getenv("PROD_DB_NAME")
	case "development":
		Cfg.DBUser = os.Getenv("DEV_DB_USER")
		Cfg.DBPass = os.Getenv("DEV_DB_PASS")
		Cfg.DBHost = os.Getenv("DEV_DB_HOST")
		Cfg.DBName = os.Getenv("DEV_DB_NAME")
	default:
		log.Fatalf("❌ Unknown APP_ENV: %s", Cfg.AppEnv)
	}

	// Sanity check
	if Cfg.DBUser == "" || Cfg.DBPass == "" || Cfg.DBHost == "" || Cfg.DBName == "" {
		log.Fatalf("❌ Incomplete DB config for APP_ENV=%s", Cfg.AppEnv)
	}
}
