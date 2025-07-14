package handlers

import (
	"net/http"
	"regexp"
	"strings"

	"urlcrawler/internal/auth"
	"urlcrawler/internal/models"

	"github.com/gin-gonic/gin"
)

// RegisterRequest defines expected fields for user registration
type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// LoginRequest defines expected fields for user login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse is the response containing the JWT token
type AuthResponse struct {
	Token string `json:"token"`
}

// Regex for basic email validation
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// Regex for validating names (including accented chars, apostrophes, spaces, hyphens)
var nameRegex = regexp.MustCompile(`^[a-zA-ZÀ-ÿ' -]+$`)

// isValidName checks if a name matches the allowed pattern
func isValidName(name string) bool {
	return nameRegex.MatchString(name)
}

// isStrongPassword checks password strength requirements:
// minimum length 8, at least one uppercase, one lowercase, one digit, one special character
func isStrongPassword(password string) bool {
	if len(password) < 8 {
		return false
	}
	var (
		hasUpper   = regexp.MustCompile(`[A-Z]`).MatchString
		hasLower   = regexp.MustCompile(`[a-z]`).MatchString
		hasNumber  = regexp.MustCompile(`[0-9]`).MatchString
		hasSpecial = regexp.MustCompile(`[!@#~$%^&*()_+{}|:"<>?\\[\];',./` + "`" + `\-]`).MatchString
	)
	return hasUpper(password) && hasLower(password) && hasNumber(password) && hasSpecial(password)
}

// RegisterHandler handles POST /register
// Validates input, checks for existing user, hashes password, creates user, and returns JWT token
func RegisterHandler(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if !isValidName(req.FirstName) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid first name"})
		return
	}

	if !isValidName(req.LastName) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid last name"})
		return
	}

	if !emailRegex.MatchString(req.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	if !isStrongPassword(req.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."})
		return
	}

	if existingUser, _ := models.GetUserByEmail(req.Email); existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Store names as lowercase for consistency
	firstName := strings.ToLower(req.FirstName)
	lastName := strings.ToLower(req.LastName)

	user, err := models.CreateUser(firstName, lastName, req.Email, hashedPassword, "user")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	token, err := auth.GenerateToken(user.ID, user.Email, string(user.Role), user.FirstName, user.LastName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, AuthResponse{Token: token})
}

// LoginHandler handles POST /login
// Authenticates user by email and password, returns JWT token if successful
func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	user, err := models.GetUserByEmail(req.Email)
	// Avoid leaking which part failed for security reasons
	if err != nil || user == nil || !auth.CheckPasswordHash(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := auth.GenerateToken(user.ID, user.Email, string(user.Role), user.FirstName, user.LastName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{Token: token})
}
