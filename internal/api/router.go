package api

import (
	"urlcrawler/internal/auth"
	"urlcrawler/internal/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.RouterGroup) {
	// Public routes (already under /api)
	router.POST("/login", handlers.LoginHandler)
	router.POST("/register", handlers.RegisterHandler)

	// Authenticated routes
	authGroup := router.Group("/")
	authGroup.Use(auth.AuthMiddleware())

	{
		authGroup.GET("/urls", handlers.GetURLsHandler)
		authGroup.GET("/urls/:id/link-count", handlers.GetLinkCountHandler)
		authGroup.GET("/urls/:id/broken-links", handlers.GetBrokenLinksHandler)
	}

	// Admin-only routes
	adminGroup := authGroup.Group("/admin")
	adminGroup.Use(auth.AdminOnlyMiddleware())

	{
		adminGroup.POST("/urls", handlers.AddURLHandler)
		adminGroup.DELETE("/urls/:id", handlers.DeleteURLHandler)
		adminGroup.POST("/urls/start", handlers.StartURLProcessingHandler)
		adminGroup.POST("/urls/stop", handlers.StopURLProcessingHandler)
	}
}
