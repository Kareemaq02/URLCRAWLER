package middleware

import (
	"strings"
	"time"

	"urlcrawler/internal/config"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// getAllowedOrigins returns the list of allowed CORS origins
// by splitting the configured string from config.
func getAllowedOrigins() []string {
    origins := strings.Split(config.Cfg.CORSOrigins, ",")
    for i, origin := range origins {
        origins[i] = strings.TrimSpace(origin)
    }
    return origins
}


// CORSMiddleware configures and returns a CORS middleware handler for Gin.
// It allows specified HTTP methods, headers, credentials, and caches options preflight for 12 hours.
func CORSMiddleware() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     getAllowedOrigins(),
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}
