package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/DarShan3115/TEAM23_CS253_ASMS/server/productivity-service/models"
	"github.com/google/uuid"
)

// CreateAssignment allows faculty to post a new task for a specific course
func (h *TaskHandler) CreateAssignment(c *gin.Context) {
	var input struct {
		Title       string    `json:"title" binding:"required"`
		Description string    `json:"description"`
		CourseID    uuid.UUID `json:"course_id" binding:"required"`
		DueDate     string    `json:"due_date" binding:"required"`
		Priority    string    `json:"priority"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required assignment fields"})
		return
	}

	// Extract Faculty ID from header
	facultyIDStr := c.GetHeader("x-user-id")
	facultyID, _ := uuid.Parse(facultyIDStr)

	// In a real app, you'd parse the DueDate string to a time.Time object
	assignment := models.Task{
		ID:          uuid.New(),
		Title:       input.Title,
		Description: input.Description,
		CourseID:    &input.CourseID,
		UserID:      facultyID, // Creator
		Priority:    input.Priority,
		Status:      "Active",
	}

	if err := h.DB.Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error while creating assignment"})
		return
	}

	c.JSON(http.StatusCreated, assignment)
}