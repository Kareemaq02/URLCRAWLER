package handlers

import (
	"net/http"
	"strconv"

	"urlcrawler/internal/models"

	"github.com/gin-gonic/gin"
)

// GetLinkCountHandler handles GET /links/:id/count
// Parses URL ID from path, fetches associated link counts from the model, returns as JSON
func GetLinkCountHandler(c *gin.Context) {
	urlIDStr := c.Param("id")
	urlID, err := strconv.Atoi(urlIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	counts, err := models.GetLinkCountByURLID(urlID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch link counts"})
		return
	}

	c.JSON(http.StatusOK, counts)
}

// GetBrokenLinksHandler handles GET /links/:id/broken
// Parses URL ID, fetches broken links associated with that URL, returns JSON array
func GetBrokenLinksHandler(c *gin.Context) {
	urlIDStr := c.Param("id")
	urlID, err := strconv.Atoi(urlIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	links, err := models.GetBrokenLinksByURLID(urlID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch broken links"})
		return
	}

	// Return empty slice instead of null to ensure consistent JSON response
	if links == nil {
		links = []models.BrokenLink{}
	}

	c.JSON(http.StatusOK, links)
}
