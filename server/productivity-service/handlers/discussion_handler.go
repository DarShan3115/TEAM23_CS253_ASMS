package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/DarShan3115/TEAM23_CS253_ASMS/server/productivity-service/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DiscussionHandler struct {
	DB *gorm.DB
}

func NewDiscussionHandler(db *gorm.DB) *DiscussionHandler {
	return &DiscussionHandler{DB: db}
}

// GetDiscussions returns the feed with role-based identity logic
func (h *DiscussionHandler) GetDiscussions(c *gin.Context) {
	courseID := c.Param("courseId")
	
	type Result struct {
		models.Discussion
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Role      string `json:"role"`
	}

	var results []Result
	// Join with the users table to get role and name
	query := h.DB.Table("discussions").
		Select("discussions.*, users.first_name, users.last_name, users.role").
		Joins("JOIN users ON users.id = discussions.author_id").
		Where("course_id = ?", courseID).
		Order("discussions.created_at desc")

	if err := query.Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch threads"})
		return
	}

	// Final pass to mask identities of students who chose to be anonymous
	for i := range results {
		if results[i].IsAnonymous && results[i].Role == "student" {
			results[i].AuthorName = "Anonymous Student"
			results[i].FirstName = ""
			results[i].LastName = ""
		} else {
			results[i].AuthorName = results[i].FirstName + " " + results[i].LastName
		}
	}

	c.JSON(http.StatusOK, results)
}

// PostToDiscussion includes server-side enforcement of Faculty identity
func (h *DiscussionHandler) PostToDiscussion(c *gin.Context) {
	var input struct {
		CourseID    string `json:"course_id" binding:"required"`
		Content     string `json:"content" binding:"required"`
		IsAnonymous bool   `json:"is_anonymous"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post data"})
		return
	}

	userID, _ := uuid.Parse(c.GetHeader("x-user-id"))
	
	// Check user role from DB
	var user struct { Role string }
	h.DB.Table("users").Select("role").Where("id = ?", userID).Scan(&user)

	// Enforcement: Faculty CANNOT be anonymous
	finalAnon := input.IsAnonymous
	if user.Role == "faculty" {
		finalAnon = false
	}

	post := models.Discussion{
		ID:          uuid.New(),
		CourseID:    uuid.MustParse(input.CourseID),
		AuthorID:    userID,
		Content:     input.Content,
		IsAnonymous: finalAnon,
	}

	if err := h.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to post"})
		return
	}

	c.JSON(http.StatusCreated, post)
}