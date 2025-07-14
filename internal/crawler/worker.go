package crawler

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"urlcrawler/internal/models"

	"github.com/PuerkitoBio/goquery"
)

// detectHTMLVersion tries to determine the HTML version from the raw HTML string
func detectHTMLVersion(rawHTML string) string {
	rawHTML = strings.ToLower(rawHTML)

	head := rawHTML
	if len(rawHTML) > 500 {
		head = rawHTML[:500]
	}

	switch {
	case strings.Contains(head, "<!doctype html>"):
		return "HTML5"
	case strings.Contains(head, "html 4.01"):
		return "HTML 4.01"
	case strings.Contains(head, "xhtml 1.0"):
		return "XHTML 1.0"
	case strings.Contains(head, "xhtml 1.1"):
		return "XHTML 1.1"
	default:
		return "Unknown"
	}
}

func ProcessURL(ctx context.Context, urlID int) error {
	fmt.Printf("Processing URL ID %d\n", urlID)

	// 1. Get URL from DB
	urlObj, err := models.GetURLByID(urlID)
	if err != nil {
		return fmt.Errorf("failed to get URL from DB: %w", err)
	}

	// 2. Fetch page
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, urlObj.URL, nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	// 2.a Read raw body bytes for HTML version detection and goquery parsing
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	// 3. Detect HTML version
	htmlVersion := detectHTMLVersion(string(bodyBytes))
	urlObj.HTMLVersion = htmlVersion

	// 4. Parse page using goquery
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(bodyBytes))
	if err != nil {
		return fmt.Errorf("failed to parse HTML: %w", err)
	}

	// 5. Extract page title
	title := strings.TrimSpace(doc.Find("title").Text())
	urlObj.Title = title

	// 6. Clean old data
	if err := models.DeleteLinksByURLID(urlID); err != nil {
		return fmt.Errorf("failed to delete old links: %w", err)
	}
	if err := models.DeleteHeadingsByURLID(urlID); err != nil {
		return fmt.Errorf("failed to delete old headings: %w", err)
	}

	// 7. Extract and store headings
	doc.Find("h1, h2, h3, h4, h5, h6").Each(func(i int, s *goquery.Selection) {
		text := strings.TrimSpace(s.Text())
		tag := goquery.NodeName(s)

		if text != "" {
			models.InsertHeading(models.Heading{
				URLID: urlID,
				Tag:   tag,
				Text:  text,
			})
		}
	})

	// 8. Extract and store links
	pageURL, err := url.Parse(urlObj.URL)
	if err != nil {
		return fmt.Errorf("invalid page URL: %w", err)
	}

	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists || strings.TrimSpace(href) == "" {
			return
		}

		absURL, err := pageURL.Parse(href)
		if err != nil {
			absURL = &url.URL{Path: href} // fallback
		}

		linkURL := absURL.String()
		statusCode := 0
		isBroken := true

		// Check if link is internal (same host) or external
		isInternal := absURL.Host == pageURL.Host

		// Try HEAD first, fallback to GET if needed
		req, _ := http.NewRequestWithContext(ctx, http.MethodHead, linkURL, nil)
		resp, err := http.DefaultClient.Do(req)
		if err != nil || resp.StatusCode >= 400 {
			// Retry with GET
			req, _ := http.NewRequestWithContext(ctx, http.MethodGet, linkURL, nil)
			resp, err = http.DefaultClient.Do(req)
		}
		if err == nil {
			statusCode = resp.StatusCode
			isBroken = statusCode >= 400
			resp.Body.Close()
		}

		// Save link to DB with internal/external info
		models.InsertLink(models.Link{
			URLID:      urlID,
			Href:       linkURL,
			StatusCode: statusCode,
			IsBroken:   isBroken,
			IsInternal: isInternal,
		})
	})

	// 9. Update URL with status and HTML version
	urlObj.Status = models.URLStatusDone
	urlObj.UpdatedAt = time.Now()
	if err := models.UpdateURL(urlObj); err != nil {
		return fmt.Errorf("failed to update URL status: %w", err)
	}

	fmt.Printf("Finished processing URL ID %d\n", urlID)
	return nil
}
