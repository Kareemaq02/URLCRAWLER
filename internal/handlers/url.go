package handlers

import (
	"context"
	"net/http"
	"regexp"
	"strconv"
	"time"

	"urlcrawler/internal/auth"
	"urlcrawler/internal/crawler"
	"urlcrawler/internal/models"

	"github.com/gin-gonic/gin"
)

// Request body for adding a URL
type AddURLRequest struct {
	URL string `json:"url"`
}

// Basic URL validation regex - supports optional http(s), domain, and optional path
var urlRegex = regexp.MustCompile(`^(https?://)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(/.*)?$`)

// normalizeURL ensures URLs start with a scheme (http:// by default)
func normalizeURL(raw string) string {
	if !regexp.MustCompile(`^https?://`).MatchString(raw) {
		return "http://" + raw
	}
	return raw
}

// AddURLHandler accepts a JSON URL, validates, associates with authenticated user, saves to DB
func AddURLHandler(c *gin.Context) {
	var req AddURLRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if !urlRegex.MatchString(req.URL) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL format"})
		return
	}

	userClaims, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	claims := userClaims.(*auth.CustomClaims)

	url := models.URL{
		UserID:    claims.UserID,
		URL:       normalizeURL(req.URL),
		Status:    models.URLStatusQueued,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := models.InsertURL(&url); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add URL"})
		return
	}

	c.JSON(http.StatusCreated, url)
}

// StartURLProcessingHandler starts asynchronous crawling for multiple URLs if not already processing
func StartURLProcessingHandler(c *gin.Context) {
	var req struct {
		URLIDs []int `json:"url_ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	started := []int{}
	skipped := map[int]string{}

	for _, id := range req.URLIDs {
		urlRecord, err := models.GetURLByID(id)
		if err != nil {
			skipped[id] = "URL not found"
			continue
		}

		if urlRecord.Status == models.URLStatusProcessing {
			skipped[id] = "Already processing"
			continue
		}

		if _, exists := crawler.GetTask(id); exists {
			skipped[id] = "Already being processed"
			continue
		}

		started = append(started, id)

		// Launch goroutine to process URL asynchronously
		go func(urlID int) {
			ctx, cancel := context.WithCancel(context.Background())
			crawler.RegisterTask(urlID, cancel)

			models.UpdateURLStatus(urlID, models.URLStatusProcessing)

			err := crawler.ProcessURL(ctx, urlID)
			if err != nil {
				models.UpdateURLStatusWithError(urlID, models.URLStatusError, err.Error())
			} else {
				models.UpdateURLStatus(urlID, models.URLStatusDone)
			}

			crawler.UnregisterTask(urlID)
		}(id)
	}

	c.JSON(http.StatusOK, gin.H{
		"started_urls": started,
		"skipped_urls": skipped,
	})
}

// StopURLProcessingHandler attempts to stop currently processing URL tasks gracefully
func StopURLProcessingHandler(c *gin.Context) {
	var req struct {
		URLIDs []int `json:"url_ids"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	stopped := []int{}
	skipped := map[int]string{}

	for _, id := range req.URLIDs {
		urlRecord, err := models.GetURLByID(id)
		if err != nil {
			skipped[id] = "URL not found"
			continue
		}

		if urlRecord.Status != models.URLStatusProcessing {
			skipped[id] = "Not in processing state"
			continue
		}

		if crawler.CancelTask(id) {
			models.UpdateURLStatus(id, models.URLStatusStopped)
			stopped = append(stopped, id)
		} else {
			skipped[id] = "Task not found or already stopped"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"stopped_urls": stopped,
		"skipped_urls": skipped,
	})
}

// GetURLsHandler returns all URLs in the system
func GetURLsHandler(c *gin.Context) {
	urls, err := models.GetAllURLs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch URLs"})
		return
	}

	c.JSON(http.StatusOK, urls)
}

// DeleteURLHandler deletes a URL by ID if it exists
func DeleteURLHandler(c *gin.Context) {
	urlIDStr := c.Param("id")
	urlID, err := strconv.Atoi(urlIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL ID"})
		return
	}

	err = models.DeleteURLByID(urlID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "URL deleted successfully"})
}
